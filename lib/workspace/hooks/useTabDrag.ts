import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { getInteractionState } from "../../global/mutable-state/interactions";
import { isActivePointerEvent } from "../../global/utils/isActivePointerEvent";
import { suppressNextClick } from "../../global/utils/suppressNextClick";
import type {
  DragPoint,
  DragSource,
  TabDropTarget,
  WorkspaceModel
} from "../types";
import { positionPreview } from "../utils/positionPreview";
import { getDropTarget } from "../utils/getDropTarget";
import { isSameDropTarget } from "../utils/isSameDropTarget";

// Pointer movement (in pixels) before a press becomes a drag; shorter presses on a tab select it
const DRAG_THRESHOLD = 5;

/**
 * Drags tabs (or whole tabsets) using pointer events (rather than HTML drag and drop) so that touch input is supported.
 *
 * Tabsets, tab lists, tabs, and tab panels identify themselves with data attributes, which are used for hit testing.
 */
export function useTabDrag({
  getModel,
  getRootElement,
  isDropDisabled,
  onDrop
}: {
  getModel: () => WorkspaceModel;
  getRootElement: () => HTMLElement | null;
  isDropDisabled: (source: DragSource, target: TabDropTarget) => boolean;
  onDrop: (source: DragSource, target: TabDropTarget) => void;
}) {
  const [dragSource, setDragSource] = useState<DragSource | undefined>();
  const [dropTarget, setDropTarget] = useState<TabDropTarget | undefined>();

  // The drag preview follows the pointer; it's positioned directly to avoid re-rendering on every move
  const previewElementRef = useRef<HTMLElement | null>(null);
  const previewPointRef = useRef<DragPoint>({ clientX: 0, clientY: 0 });

  // Cancels the current drag (if any); called if the workspace unmounts mid-drag,
  // so that releasing the pointer later doesn't drop the tab into a workspace that's no longer shown
  const cancelDragRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelDragRef.current?.(), []);

  const startDrag = useCallback(
    (source: DragSource, event: ReactPointerEvent<HTMLElement>) => {
      const rootElement = getRootElement();
      if (!rootElement) {
        return;
      }

      // Without separators, pressing near the edge of a tabset (e.g. on its tabs or header) may have started resizing it instead,
      // since resizing handles "pointerdown" events first (during the capture phase); a press shouldn't do both
      const interactionState = getInteractionState();
      if (
        interactionState.state === "active" &&
        isActivePointerEvent(
          interactionState,
          event.currentTarget.ownerDocument,
          event
        )
      ) {
        return;
      }

      // End any drag in progress first (e.g. by another pointer), so that the styles saved below are the page's own
      cancelDragRef.current?.();

      // The pressed tab (or tabset header)
      const sourceElement = event.currentTarget;
      const ownerDocument = sourceElement.ownerDocument;
      const { clientX: startX, clientY: startY, pointerId } = event;

      // Route all events for this pointer to the pressed element, even over iframes or outside of the window
      sourceElement.setPointerCapture?.(pointerId);

      let isDragging = false;
      let target: TabDropTarget | undefined = undefined;
      let rawTarget: TabDropTarget | undefined = undefined;

      // Inline styles changed while dragging are restored afterward
      const prevStyles = {
        cursor: ownerDocument.documentElement.style.cursor,
        sourceCursor: sourceElement.style.cursor,
        userSelect: ownerDocument.body.style.userSelect
      };
      const setCursor = (cursor: string | undefined) => {
        ownerDocument.documentElement.style.cursor =
          cursor ?? prevStyles.cursor;
        sourceElement.style.cursor = cursor ?? prevStyles.sourceCursor;
      };

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }

        const { clientX, clientY } = moveEvent;
        if (!isDragging) {
          if (Math.hypot(clientX - startX, clientY - startY) < DRAG_THRESHOLD) {
            return;
          }

          isDragging = true;
          ownerDocument.body.style.userSelect = "none";
          setDragSource(source);
        }

        previewPointRef.current = { clientX, clientY };
        positionPreview(previewElementRef.current, previewPointRef.current);

        const nextRawTarget = getDropTarget({
          clientX,
          clientY,
          model: getModel(),
          rootElement,
          source
        });
        if (!isSameDropTarget(rawTarget, nextRawTarget)) {
          rawTarget = nextRawTarget;

          const isRejected =
            nextRawTarget !== undefined &&
            isDropDisabled(source, nextRawTarget);
          target = isRejected ? undefined : nextRawTarget;

          setCursor(isRejected ? "not-allowed" : undefined);
          setDropTarget(target);
        }
      };

      const stop = (
        shouldDrop: boolean,
        { isPointerDown = false }: { isPointerDown?: boolean } = {}
      ) => {
        cancelDragRef.current = null;

        ownerDocument.removeEventListener("pointermove", onPointerMove);
        ownerDocument.removeEventListener("pointerup", onPointerUp);
        ownerDocument.removeEventListener("pointercancel", onPointerCancel);
        ownerDocument.removeEventListener("keydown", onKeyDown, true);
        ownerWindow?.removeEventListener("blur", onWindowBlur);

        if (isDragging) {
          ownerDocument.body.style.userSelect = prevStyles.userSelect;
          setCursor(undefined);
          setDragSource(undefined);
          setDropTarget(undefined);

          // A click shouldn't also be handled (e.g. selecting the tab after a canceled drag)
          if (isPointerDown) {
            // The click is dispatched when the pointer is released, so wait for that
            const onRelease = (releaseEvent: PointerEvent) => {
              if (releaseEvent.pointerId === pointerId) {
                ownerDocument.removeEventListener("pointerup", onRelease);
                ownerDocument.removeEventListener("pointercancel", onRelease);
                suppressNextClick(ownerDocument);
              }
            };
            ownerDocument.addEventListener("pointerup", onRelease);
            ownerDocument.addEventListener("pointercancel", onRelease);
          } else {
            suppressNextClick(ownerDocument);
          }

          if (shouldDrop && target) {
            onDrop(source, target);
          }
        }
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId === pointerId) {
          stop(true);
        }
      };

      const onPointerCancel = (cancelEvent: PointerEvent) => {
        if (cancelEvent.pointerId === pointerId) {
          stop(false);
        }
      };

      const onKeyDown = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === "Escape") {
          // Canceling a drag shouldn't also be handled elsewhere (e.g. by closing a dialog the workspace is in)
          if (isDragging) {
            keyEvent.preventDefault();
            keyEvent.stopPropagation();
          }

          stop(false, { isPointerDown: true });
        }
      };

      // The pointer may be released while the window doesn't have focus (e.g. after switching apps),
      // in which case the release isn't reported
      const ownerWindow = ownerDocument.defaultView;
      const onWindowBlur = () => stop(false);

      cancelDragRef.current = () => stop(false);

      ownerDocument.addEventListener("pointermove", onPointerMove);
      ownerDocument.addEventListener("pointerup", onPointerUp);
      ownerDocument.addEventListener("pointercancel", onPointerCancel);
      // Listen during the capture phase, so that Escape can be handled before other listeners (see onKeyDown)
      ownerDocument.addEventListener("keydown", onKeyDown, true);
      ownerWindow?.addEventListener("blur", onWindowBlur);
    },
    [getModel, getRootElement, isDropDisabled, onDrop]
  );

  const startTabDrag = useCallback(
    (tabId: string, event: ReactPointerEvent<HTMLElement>) =>
      startDrag({ tabId, type: "tab" }, event),
    [startDrag]
  );

  const startTabsetDrag = useCallback(
    (tabsetId: string, event: ReactPointerEvent<HTMLElement>) =>
      startDrag({ tabsetId, type: "tabset" }, event),
    [startDrag]
  );

  return {
    dragSource,
    dropTarget,
    previewElementRef,
    previewPointRef,
    startTabDrag,
    startTabsetDrag
  };
}
