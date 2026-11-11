import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { getInteractionState } from "../../global/mutable-state/interactions";
import { isActivePointerEvent } from "../../global/utils/isActivePointerEvent";
import { suppressNextClick } from "../../global/utils/suppressNextClick";
import { getModelIndex } from "../models/getModelIndex";
import { createId } from "../models/createId";
import {
  getNativeDrag,
  setNativeDrag,
  subscribeToNativeDrag,
  updateNativeDragDocument,
  type NativeDrag
} from "../mutable-state/nativeDrag";
import {
  connectNativeDragChannel,
  reportNativeDragover,
  shareNativeDrag
} from "../mutable-state/nativeDragChannel";
import { warnOnce } from "../../shared/utils/warnOnce";
import { isHTMLElement } from "../../shared/utils/isHTMLElement";
import { WORKSPACE_DRAG_DATA_TYPE } from "../constants";
import type {
  DragNode,
  DragPoint,
  DragSource,
  ExternalDragOptions,
  ExternalDragResult,
  TabDropTarget,
  TabNode,
  WorkspaceModel
} from "../types";
import type { DragStore } from "../utils/createDragStore";
import type { TabsetElementRegistry } from "../utils/createTabsetElementRegistry";
import { positionPreview } from "../utils/positionPreview";
import { getDropTarget } from "../utils/getDropTarget";
import { getEmptyDragImage } from "../utils/getEmptyDragImage";
import { isNativeTearOff } from "../utils/isNativeTearOff";
import { isOutsideOfWindow } from "../utils/isOutsideOfWindow";
import { isSameDropTarget } from "../utils/isSameDropTarget";
import { toPointerPress, type PointerPress } from "../utils/toPointerPress";

// Pointer movement (in pixels) before a press becomes a drag; shorter presses on a tab select it
const DRAG_THRESHOLD = 5;

// Identifies the drag too, so that a drag that was never shared (or an earlier one) isn't mistaken for a drag from another page whose end was missed;
// drag data types can be read during the drag (and browsers lowercase them, as ids are)
const getIdDataType = (id: string) => `${WORKSPACE_DRAG_DATA_TYPE};id=${id}`;

/**
 * Drags tabs (or whole tabsets) using pointer events (rather than HTML drag and drop) so that touch input is supported.
 *
 * Tabsets, tab lists, tabs, and tab panels identify themselves with data attributes, which are used for hit testing.
 *
 * Pointer capture keeps reporting the pointer after it leaves the window, so a source released outside of the window can be torn off (see onTearOff).
 *
 * Workspaces with a `dragGroup` drag with the mouse using HTML drag and drop instead, so that tabs can be dropped into workspaces in other windows;
 * each workspace in the group listens for the drag within its own document, and the workspace under the pointer shows the drop indicator.
 * These drags are shared with workspaces in other pages from the same origin too (see nativeDragChannel), unless `disableDragBetweenApps` is set.
 */
export function useTabDrag({
  canTearOff,
  disableDragBetweenApps,
  dragGroup,
  dragStore,
  getDragNode,
  getModel,
  getRootElement,
  isDropDisabled,
  isExternalDropDisabled,
  isNewTabDropDisabled,
  onDrop,
  onNewTabDrop,
  onTearOff,
  onTransferIn,
  onTransferOut,
  rootElement,
  tabsetElements
}: {
  canTearOff: (source: DragSource) => boolean;
  disableDragBetweenApps: boolean;
  dragGroup: string | undefined;
  // The drop target is shown by the components that subscribe to this store (rather than being returned), so that the workspace doesn't re-render as it changes
  dragStore: DragStore;
  getDragNode: (source: DragSource) => DragNode | undefined;
  getModel: () => WorkspaceModel;
  getRootElement: () => HTMLElement | null;
  isDropDisabled: (source: DragSource, target: TabDropTarget) => boolean;
  isExternalDropDisabled: (node: DragNode, target: TabDropTarget) => boolean;
  isNewTabDropDisabled: (tab: TabNode, target: TabDropTarget) => boolean;
  onDrop: (source: DragSource, target: TabDropTarget) => void;
  /** Adds a tab dragged in from outside of the workspace (see startExternalDrag); returns whether it was added */
  onNewTabDrop: (tab: TabNode, target: TabDropTarget) => boolean;
  onTearOff: (
    source: DragSource,
    point: { screenX: number; screenY: number }
  ) => void;
  onTransferIn: (node: DragNode, target: TabDropTarget) => boolean;
  onTransferOut: (source: DragSource) => void;
  rootElement: HTMLElement | null;
  tabsetElements: TabsetElementRegistry;
}) {
  // The source is also shared through the store (see Tab), which is updated along with this state
  const [dragSource, setDragSourceState] = useState<DragSource | undefined>();
  const setDragSource = useCallback(
    (source: DragSource | undefined) => {
      setDragSourceState(source);
      dragStore.setDragSource(source);
    },
    [dragStore]
  );
  const setDropTarget = dragStore.setDropTarget;
  const [isTearOff, setIsTearOff] = useState(false);

  // A tab dragged in from outside of the workspace (see startExternalDrag), which isn't in the model yet
  const [newTabPreview, setNewTabPreview] = useState<
    { preview: ReactNode | undefined; tab: TabNode } | undefined
  >();

  // While a drag uses HTML drag and drop, the preview is shown by one workspace in each document (rather than by the source),
  // since the drag can move into other windows; isNativeDragSource is set for the workspace the drag started in
  const [isNativeDragSource, setIsNativeDragSource] = useState(false);
  const [nativePreviewNode, setNativePreviewNode] = useState<
    DragNode | undefined
  >();

  // Set while a drag (using HTML drag and drop) from this workspace's group is over its document, whether or not this workspace shows its preview,
  // so that the drop indicator stays mounted (and can be animated between tabsets) while it's over this workspace
  const [isNativeDragOver, setIsNativeDragOver] = useState(false);

  // Identifies this workspace in NativeDrag records
  const [owner] = useState(() => ({}));

  // The drag preview follows the pointer; it's positioned directly to avoid re-rendering on every move
  const previewElementRef = useRef<HTMLElement | null>(null);
  const previewPointRef = useRef<DragPoint>({ clientX: 0, clientY: 0 });

  // Cancels the current drag (if any); called if the workspace unmounts mid-drag,
  // so that releasing the pointer later doesn't drop the tab into a workspace that's no longer shown
  const cancelDragRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelDragRef.current?.(), []);

  // The drag starts when the pressed element is dragged, so it's made draggable only while pressed
  // (rather than by setting the attribute on every tab, which custom tabs rendered by renderTab would have to pass along)
  const startNativeDrag = useCallback(
    (source: DragSource, sourceElement: HTMLElement, group: string) => {
      const ownerDocument = sourceElement.ownerDocument;
      const prevDraggable = sourceElement.getAttribute("draggable");
      sourceElement.draggable = true;

      let drag: NativeDrag | null = null;

      const cleanUp = () => {
        if (cancelDragRef.current === cancel) {
          cancelDragRef.current = null;
        }

        sourceElement.removeEventListener("dragstart", onDragStart);
        sourceElement.removeEventListener("dragend", onDragEnd);
        ownerDocument.removeEventListener("pointerup", onPointerUp);
        ownerDocument.removeEventListener("pointercancel", onPointerUp);

        if (prevDraggable === null) {
          sourceElement.removeAttribute("draggable");
        } else {
          sourceElement.setAttribute("draggable", prevDraggable);
        }
      };

      // Elements within the tab are draggable by default too (e.g. images, selected text), and start the drag when pressed;
      // only other elements that are explicitly draggable are ignored
      const isOwnDragEvent = (event: DragEvent) => {
        const target = event.target as Element | null;

        return (
          target === sourceElement ||
          (!!target &&
            sourceElement.contains(target) &&
            target.getAttribute?.("draggable") !== "true")
        );
      };

      const onDragStart = (event: DragEvent) => {
        if (!isOwnDragEvent(event)) {
          // The pointer is canceled when the other element starts dragging, so the press is over
          cleanUp();
          return;
        }

        ownerDocument.removeEventListener("pointerup", onPointerUp);
        ownerDocument.removeEventListener("pointercancel", onPointerUp);

        const node = getDragNode(source);
        const { dataTransfer } = event;
        if (!node || !dataTransfer) {
          event.preventDefault();
          cleanUp();
          return;
        }

        dataTransfer.effectAllowed = "move";
        const id = createId();
        dataTransfer.setData(WORKSPACE_DRAG_DATA_TYPE, "");
        dataTransfer.setData(getIdDataType(id), "");
        dataTransfer.setDragImage(getEmptyDragImage(ownerDocument), 0, 0);

        drag = {
          dragGroup: group,
          hasSource: () => getDragNode(source) !== undefined,
          id,
          isDropped: false,
          isRemote: false,
          isShared: false,
          lastDocument: ownerDocument,
          lastDragover: undefined,
          lastMoveStep: 0,
          lastRemoteDragoverTime: 0,
          node,
          previewOwners: new Map([[ownerDocument, owner]]),
          removeFromSource: () => onTransferOut(source),
          source,
          sourceOwner: owner
        };

        previewPointRef.current = {
          clientX: event.clientX,
          clientY: event.clientY
        };
        setDragSource(source);
        setIsNativeDragSource(true);
        setNativePreviewNode(node);
        if (!disableDragBetweenApps) {
          shareNativeDrag(drag);
        }
        setNativeDrag(drag);
      };

      // Not dispatched if the element was removed during the drag (e.g. when it was dropped elsewhere), so drops end the drag too (see below)
      const onDragEnd = (event: DragEvent) => {
        if (!isOwnDragEvent(event)) {
          return;
        }

        const ended = drag;
        cleanUp();

        if (!ended || getNativeDrag() !== ended) {
          return;
        }

        setNativeDrag(null);

        // Torn off sources are handed to the application synchronously (e.g. so it can open a popup window, which some browsers block anyway)
        if (canTearOff(source) && isNativeTearOff(ended, Date.now())) {
          // Some browsers report the wrong position for dragend events (e.g. 0, 0), so the last dragover's position is used then
          const { lastDragover } = ended;
          const isBogus = event.screenX === 0 && event.screenY === 0;
          onTearOff(
            source,
            isBogus && lastDragover
              ? {
                  screenX: lastDragover.view.screenX + lastDragover.clientX,
                  screenY: lastDragover.view.screenY + lastDragover.clientY
                }
              : { screenX: event.screenX, screenY: event.screenY }
          );
        }
      };

      // Released without dragging (e.g. a click)
      const onPointerUp = () => cleanUp();

      // Called if the workspace unmounts mid-drag (or another drag starts)
      const cancel = () => {
        cleanUp();
        if (drag && getNativeDrag() === drag) {
          setNativeDrag(null);
        }
      };
      cancelDragRef.current = cancel;

      sourceElement.addEventListener("dragstart", onDragStart);
      sourceElement.addEventListener("dragend", onDragEnd);
      ownerDocument.addEventListener("pointerup", onPointerUp);
      ownerDocument.addEventListener("pointercancel", onPointerUp);
    },
    [
      canTearOff,
      disableDragBetweenApps,
      getDragNode,
      onTearOff,
      onTransferOut,
      owner,
      setDragSource
    ]
  );

  // Every workspace in the group listens for drags (from any workspace in the group) within its own document
  useEffect(() => {
    if (dragGroup === undefined || !rootElement) {
      return;
    }

    const ownerDocument = rootElement.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;

    // Loaded ahead of time (see getEmptyDragImage)
    getEmptyDragImage(ownerDocument);

    const disconnect = disableDragBetweenApps
      ? undefined
      : connectNativeDragChannel();

    const getActiveDrag = (event: DragEvent) => {
      const drag = getNativeDrag();
      if (drag?.dragGroup !== dragGroup) {
        return null;
      }

      // Drags from other pages are checked against the drag's data types, in case the message that ended one was missed (e.g. its page was closed)
      if (
        drag.isRemote &&
        (disableDragBetweenApps ||
          !Array.from(event.dataTransfer?.types ?? []).includes(
            getIdDataType(drag.id)
          ))
      ) {
        return null;
      }

      // Browsers don't dispatch dragend if the source was removed during the drag, so it's ended here
      if (!drag.hasSource()) {
        setNativeDrag(null);
        return null;
      }

      return drag;
    };

    // Drag events are dispatched continuously (even while the pointer isn't moving),
    // so whether a target is disabled is only checked again when the target (or the drag, or the model) changes
    let lastTarget: {
      drag: NativeDrag;
      isDisabled: boolean;
      model: WorkspaceModel;
      target: TabDropTarget;
    } | null = null;

    const getTarget = (event: DragEvent, drag: NativeDrag) => {
      // Only the innermost workspace under the pointer (e.g. not one that has another workspace within a tab) accepts the drop
      const element = event.composedPath()[0] as Element | undefined;
      if (
        typeof element?.closest !== "function" ||
        element.closest("[data-workspace]") !== rootElement
      ) {
        return undefined;
      }

      const model = getModel();
      const target = getDropTarget({
        clientX: event.clientX,
        clientY: event.clientY,
        model,
        isExternal: drag.sourceOwner !== owner,
        rootElement,
        source: drag.source,
        tabsetElements
      });
      if (!target) {
        return undefined;
      }

      if (
        lastTarget?.drag !== drag ||
        lastTarget.model !== model ||
        !isSameDropTarget(lastTarget.target, target)
      ) {
        lastTarget = {
          drag,
          isDisabled:
            drag.sourceOwner === owner
              ? isDropDisabled(drag.source, target)
              : isExternalDropDisabled(drag.node, target),
          model,
          target
        };
      }

      return lastTarget.isDisabled ? undefined : lastTarget.target;
    };

    const onDragOver = (event: DragEvent) => {
      const drag = getActiveDrag(event);
      if (!drag) {
        return;
      }

      // Recorded once per event, although every workspace in the document handles it
      const { clientX, clientY } = event;
      const last = drag.lastDragover;
      if (
        ownerWindow &&
        (last?.view !== ownerWindow ||
          last.clientX !== clientX ||
          last.clientY !== clientY)
      ) {
        if (last?.view === ownerWindow) {
          drag.lastMoveStep = Math.hypot(
            clientX - last.clientX,
            clientY - last.clientY
          );
        }
        drag.lastDragover = {
          clientX,
          clientY,
          time: Date.now(),
          view: ownerWindow
        };
      } else if (last) {
        last.time = Date.now();
      }
      updateNativeDragDocument(drag, ownerDocument);
      reportNativeDragover(drag);
      setIsNativeDragOver(true);

      // The first workspace the drag reaches in each document shows the preview there (the source does in its own document)
      if (!drag.previewOwners.has(ownerDocument)) {
        drag.previewOwners.set(ownerDocument, owner);
      }
      if (drag.previewOwners.get(ownerDocument) === owner) {
        previewPointRef.current = { clientX, clientY };
        positionPreview(previewElementRef.current, previewPointRef.current);
        setNativePreviewNode(drag.node);
      }

      const target = getTarget(event, drag);
      if (target) {
        // Accepts the drop
        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }
      }

      setDropTarget(target);
    };

    const onDropEvent = (event: DragEvent) => {
      const drag = getActiveDrag(event);
      const target = drag ? getTarget(event, drag) : undefined;
      if (!drag || !target) {
        return;
      }

      event.preventDefault();
      drag.isDropped = true;
      setNativeDrag(null);

      if (drag.sourceOwner === owner) {
        onDrop(drag.source, target);
      } else if (onTransferIn(drag.node, target)) {
        drag.removeFromSource();
      }
    };

    // Indicators and previews are only shown in the document the pointer is over, and only while dragging
    const unsubscribe = subscribeToNativeDrag((drag) => {
      if (drag?.dragGroup !== dragGroup) {
        setDragSource(undefined);
        setDropTarget(undefined);
        setIsNativeDragOver(false);
        setIsNativeDragSource(false);
        setNativePreviewNode(undefined);
      } else if (drag.lastDocument !== ownerDocument) {
        setDropTarget(undefined);
        setIsNativeDragOver(false);
        setNativePreviewNode(undefined);
      }
    });

    // Elements only accept drops if both events are canceled
    ownerDocument.addEventListener("dragenter", onDragOver);
    ownerDocument.addEventListener("dragover", onDragOver);
    ownerDocument.addEventListener("drop", onDropEvent);

    return () => {
      disconnect?.();
      unsubscribe();
      ownerDocument.removeEventListener("dragenter", onDragOver);
      ownerDocument.removeEventListener("dragover", onDragOver);
      ownerDocument.removeEventListener("drop", onDropEvent);
    };
  }, [
    disableDragBetweenApps,
    dragGroup,
    getModel,
    isDropDisabled,
    isExternalDropDisabled,
    onDrop,
    onTransferIn,
    owner,
    rootElement,
    setDragSource,
    setDropTarget,
    tabsetElements
  ]);

  const startDrag = useCallback(
    (source: DragSource, press: PointerPress, newTab?: NewTabDrag) => {
      const rootElement = getRootElement();

      // Without separators, pressing near the edge of a tabset (e.g. on its tabs or header) may have started resizing it instead,
      // since resizing handles "pointerdown" events first (during the capture phase); a press shouldn't do both
      const interactionState = getInteractionState();
      if (
        !rootElement ||
        (interactionState.state === "active" &&
          isActivePointerEvent(
            interactionState,
            press.element.ownerDocument,
            press
          ))
      ) {
        newTab?.onEnd(undefined);
        return;
      }

      // End any drag in progress first (e.g. by another pointer), so that the styles saved below are the page's own
      cancelDragRef.current?.();

      // Pointer events can't follow the pointer into other windows, so mouse drags between workspaces use HTML drag and drop;
      // touch input doesn't start those drags (in most browsers), so it still uses pointer events.
      // New tabs (see startExternalDrag) can't be dropped into other workspaces, so they always use pointer events.
      if (
        !newTab &&
        isHTMLElement(press.element) &&
        dragGroup !== undefined &&
        press.pointerType !== "touch" &&
        press.pointerType !== "pen"
      ) {
        startNativeDrag(source, press.element, dragGroup);
        return;
      }

      // The pressed tab (or tabset header, or the application's element for a new tab)
      const sourceElement = press.element;
      const ownerDocument = sourceElement.ownerDocument;
      const { clientX: startX, clientY: startY, pointerId } = press;

      // Route all events for this pointer to the pressed element, even over iframes or outside of the window
      sourceElement.setPointerCapture?.(pointerId);

      let isDragging = false;
      let isTearOffTarget = false;
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

          // New tabs aren't in the model yet, so they're previewed directly (rather than looked up by the drag source)
          if (newTab) {
            setNewTabPreview({ preview: newTab.preview, tab: newTab.tab });
          } else {
            setDragSource(source);
          }
        }

        previewPointRef.current = { clientX, clientY };
        positionPreview(previewElementRef.current, previewPointRef.current);

        // Nothing outside of the window can be hit (elementFromPoint returns null there), so the source can only be torn off
        const isOutside = isOutsideOfWindow(ownerWindow, clientX, clientY);
        const nextIsTearOffTarget = isOutside && !newTab && canTearOff(source);
        if (isTearOffTarget !== nextIsTearOffTarget) {
          isTearOffTarget = nextIsTearOffTarget;
          setIsTearOff(nextIsTearOffTarget);
        }

        const nextRawTarget = isOutside
          ? undefined
          : getDropTarget({
              clientX,
              clientY,
              // New tabs are inserted like tabs from other workspaces are
              isExternal: !!newTab,
              model: getModel(),
              rootElement,
              source,
              tabsetElements
            });
        if (!isSameDropTarget(rawTarget, nextRawTarget)) {
          rawTarget = nextRawTarget;

          const isRejected =
            nextRawTarget !== undefined &&
            (newTab
              ? isNewTabDropDisabled(newTab.tab, nextRawTarget)
              : isDropDisabled(source, nextRawTarget));
          target = isRejected ? undefined : nextRawTarget;

          setCursor(isRejected ? "not-allowed" : undefined);
          setDropTarget(target);
        }
      };

      const stop = (
        shouldDrop: boolean,
        {
          isPointerDown = false,
          screenPoint
        }: {
          isPointerDown?: boolean;
          screenPoint?: { screenX: number; screenY: number };
        } = {}
      ) => {
        cancelDragRef.current = null;

        ownerDocument.removeEventListener("pointermove", onPointerMove);
        ownerDocument.removeEventListener("pointerup", onPointerUp);
        ownerDocument.removeEventListener("pointercancel", onPointerCancel);
        ownerDocument.removeEventListener("keydown", onKeyDown, true);
        if (newTab) {
          ownerDocument.removeEventListener("dragstart", onDragStart, true);
        }
        ownerWindow?.removeEventListener("blur", onWindowBlur);

        let droppedTarget: TabDropTarget | undefined = undefined;

        if (isDragging) {
          ownerDocument.body.style.userSelect = prevStyles.userSelect;
          setCursor(undefined);
          setDragSource(undefined);
          setNewTabPreview(undefined);
          setDropTarget(undefined);
          setIsTearOff(false);

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

          if (shouldDrop) {
            // Torn off sources are handed to the application synchronously, while the release is being handled (e.g. so it can open a popup window)
            if (isTearOffTarget && screenPoint) {
              onTearOff(source, screenPoint);
            } else if (target) {
              if (!newTab) {
                onDrop(source, target);
              } else {
                // onNewTabDrop reaches application code (onModelChanged), which may throw after the model was updated;
                // the error is left to propagate, but the promise must still settle, and report whether the tab was added
                // (its id wasn't in the model before, so being there means it landed)
                try {
                  if (onNewTabDrop(newTab.tab, target)) {
                    droppedTarget = target;
                  }
                } catch (error) {
                  newTab.onEnd(
                    getModelIndex(getModel()).tabsetsByTabId.has(newTab.tab.id)
                      ? target
                      : undefined
                  );
                  throw error;
                }
              }
            }
          }
        }

        newTab?.onEnd(droppedTarget);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId === pointerId) {
          const { screenX, screenY } = upEvent;
          stop(true, { screenPoint: { screenX, screenY } });
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

      // The application's element for a new tab may be draggable by default (e.g. a link or an image),
      // and the browser's drag would cancel the pointer
      const onDragStart = (dragEvent: DragEvent) => {
        if (sourceElement.contains(dragEvent.target as Node | null)) {
          dragEvent.preventDefault();
        }
      };

      cancelDragRef.current = () => stop(false);

      ownerDocument.addEventListener("pointermove", onPointerMove);
      ownerDocument.addEventListener("pointerup", onPointerUp);
      ownerDocument.addEventListener("pointercancel", onPointerCancel);
      // Listen during the capture phase, so that Escape can be handled before other listeners (see onKeyDown)
      ownerDocument.addEventListener("keydown", onKeyDown, true);
      if (newTab) {
        ownerDocument.addEventListener("dragstart", onDragStart, true);
      }
      ownerWindow?.addEventListener("blur", onWindowBlur);
    },
    [
      canTearOff,
      dragGroup,
      getModel,
      getRootElement,
      isDropDisabled,
      isNewTabDropDisabled,
      onDrop,
      onNewTabDrop,
      onTearOff,
      setDragSource,
      setDropTarget,
      startNativeDrag,
      tabsetElements
    ]
  );

  const startTabDrag = useCallback(
    (tabId: string, event: ReactPointerEvent<HTMLElement>) =>
      startDrag({ tabId, type: "tab" }, toPointerPress(event)),
    [startDrag]
  );

  const startTabsetDrag = useCallback(
    (tabsetId: string, event: ReactPointerEvent<HTMLElement>) =>
      startDrag({ tabsetId, type: "tabset" }, toPointerPress(event)),
    [startDrag]
  );

  // Drags a tab that isn't in the workspace yet, from an element of the application (see the imperative startExternalDrag method)
  const startExternalDrag = useCallback(
    (
      event: PointerEvent | ReactPointerEvent<Element>,
      { preview, tab }: ExternalDragOptions
    ) =>
      new Promise<ExternalDragResult>((resolve) => {
        // isHTMLElement accepts any element (including SVG), which is fine since only style, pointer capture and containment are used
        // currentTarget is only set while the event is dispatched, so the event's target is used if it's called later
        const element = event.currentTarget ?? event.target;

        // Pointer events can't be followed in other documents, and a pointer that isn't pressed (e.g. a click) can't drag
        if (
          !isHTMLElement(element) ||
          element.ownerDocument !== getRootElement()?.ownerDocument
        ) {
          if (process.env.NODE_ENV !== "production") {
            warnOnce(
              "startExternalDrag requires an event for an element in the same document as the workspace"
            );
          }
          resolve(null);
          return;
        }

        // Like tabs, only the primary button (or touch/pen contact) starts a drag
        if (event.button !== 0 || event.buttons === 0) {
          resolve(null);
          return;
        }

        startDrag(
          { tabId: tab.id, type: "tab" },
          {
            clientX: event.clientX,
            clientY: event.clientY,
            element,
            pointerId: event.pointerId,
            pointerType: event.pointerType
          },
          {
            onEnd: (target) => resolve(target ? { target } : null),
            preview,
            tab
          }
        );
      }),
    [getRootElement, startDrag]
  );

  return {
    dragSource,
    isNativeDragOver,
    isNativeDragSource,
    isTearOff,
    nativePreviewNode,
    newTabPreview,
    previewElementRef,
    previewPointRef,
    startExternalDrag,
    startTabDrag,
    startTabsetDrag
  };
}

// A tab dragged into the workspace from outside of it (see startExternalDrag)
type NewTabDrag = {
  /** Called once when the drag ends, with where the tab was added (or undefined) */
  onEnd: (target: TabDropTarget | undefined) => void;
  preview: ReactNode | undefined;
  tab: TabNode;
};
