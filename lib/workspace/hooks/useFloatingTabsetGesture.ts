import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef
} from "react";
import { getClientScale } from "../../global/dom/getClientScale";
import { suppressNextClick } from "../../global/utils/suppressNextClick";
import type { UpdateModel } from "../contexts/WorkspaceContext";
import { getModelIndex } from "../models/getModelIndex";
import { updateTabset } from "../models/updateTabset";
import type { FloatingTabsetRect, MinimumSize } from "../types";
import {
  clampFloatingPosition,
  type FloatingHeaderBox
} from "../utils/clampFloatingPosition";
import { getFloatingTabsetHeaderBox } from "../utils/getFloatingTabsetHeaderBox";

// Pointer movement (in pixels) before a press moves (or resizes) a floating tabset; shorter presses (e.g. clicks) leave it where it is
const GESTURE_THRESHOLD = 3;

/**
 * Edge (or corner) of a floating tabset that a resize handle is on.
 */
export type FloatingResizeEdge =
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right"
  | "top"
  | "top-left"
  | "top-right";

// Set on a floating tabset's element while a gesture is positioning it, so that renders don't move it (see FloatingTabsets)
export const FLOATING_GESTURE_ATTRIBUTE = "data-floating-gesture";

export type FloatingGesture = "move" | FloatingResizeEdge;

export const FLOATING_RESIZE_CURSORS: { [edge in FloatingResizeEdge]: string } =
  {
    bottom: "ns-resize",
    "bottom-left": "nesw-resize",
    "bottom-right": "nwse-resize",
    left: "ew-resize",
    right: "ew-resize",
    top: "ns-resize",
    "top-left": "nwse-resize",
    "top-right": "nesw-resize"
  };

/**
 * Moves floating tabsets (by their headers) and resizes them (by their edges) with the pointer.
 *
 * The tabset's element is positioned directly while the pointer moves (rather than re-rendering), and the model is changed once, when it's released;
 * Escape (or a canceled pointer) puts it back.
 *
 * ℹ️ A moved tabset keeps its header within the layout, so that it can be dragged back (see clampFloatingPosition);
 * a resized tabset stays at least its minimum size (see getMinimumSize), and its edges stay within the layout (unless they were already outside of it).
 */
export function useFloatingTabsetGesture({
  getMinimumSize,
  updateModel
}: {
  getMinimumSize: (tabsetId: string) => MinimumSize;
  updateModel: UpdateModel;
}) {
  // Cancels the current gesture (if any), e.g. if the workspace unmounts mid-gesture
  const cancelRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelRef.current?.(), []);

  return useCallback(
    (
      tabsetId: string,
      gesture: FloatingGesture,
      event: ReactPointerEvent<HTMLElement>
    ) => {
      const frame = getFloatingTabsetElement(event.currentTarget, tabsetId);
      const layer = frame?.parentElement;
      if (!frame || !layer) {
        return;
      }

      cancelRef.current?.();

      const sourceElement = event.currentTarget;
      const ownerDocument = sourceElement.ownerDocument;
      const ownerWindow = ownerDocument.defaultView;
      const { clientX: startX, clientY: startY, pointerId } = event;
      sourceElement.setPointerCapture?.(pointerId);

      // Measured in the layout's pixels (which pointer movements are converted to; see getClientScale)
      const scaleX = getClientScale(frame, "horizontal");
      const scaleY = getClientScale(frame, "vertical");
      const layout = { height: layer.offsetHeight, width: layer.offsetWidth };
      const start: FloatingTabsetRect = {
        height: frame.offsetHeight,
        width: frame.offsetWidth,
        x: frame.offsetLeft,
        y: frame.offsetTop
      };
      const header: FloatingHeaderBox = getFloatingTabsetHeaderBox(frame) ?? {
        height: 0,
        left: 0,
        top: 0,
        width: 0
      };
      const minimumSize = getMinimumSize(tabsetId);

      // Only the parts of the rect that the gesture changes are positioned (and saved), e.g. resizing a collapsed tabset's width leaves its height to fit its header
      const fields = getGestureFields(gesture);

      // The tabset is put back (with the styles React rendered) if the gesture is canceled
      const prevFrameStyles = Object.fromEntries(
        fields.map((field) => [field, frame.style[STYLE_PROPERTIES[field]]])
      );
      const prevStyles = {
        cursor: ownerDocument.documentElement.style.cursor,
        userSelect: ownerDocument.body.style.userSelect
      };

      let isActive = false;
      let rect = start;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }

        const { clientX, clientY } = moveEvent;
        if (!isActive) {
          if (
            Math.hypot(clientX - startX, clientY - startY) < GESTURE_THRESHOLD
          ) {
            return;
          }

          isActive = true;
          frame.setAttribute(FLOATING_GESTURE_ATTRIBUTE, "");
          ownerDocument.body.style.userSelect = "none";
          if (gesture !== "move") {
            ownerDocument.documentElement.style.cursor =
              FLOATING_RESIZE_CURSORS[gesture];
          }
        }

        const deltaX = (clientX - startX) / scaleX;
        const deltaY = (clientY - startY) / scaleY;
        rect =
          gesture === "move"
            ? {
                ...start,
                ...clampFloatingPosition(
                  { x: start.x + deltaX, y: start.y + deltaY },
                  header,
                  layout
                )
              }
            : resize(start, gesture, deltaX, deltaY, minimumSize, layout);

        for (const field of fields) {
          frame.style[STYLE_PROPERTIES[field]] = `${rect[field]}px`;
        }
      };

      const stop = (shouldCommit: boolean) => {
        cancelRef.current = null;

        ownerDocument.removeEventListener("pointermove", onPointerMove);
        ownerDocument.removeEventListener("pointerup", onPointerUp);
        ownerDocument.removeEventListener("pointercancel", onPointerCancel);
        ownerDocument.removeEventListener("keydown", onKeyDown, true);
        ownerWindow?.removeEventListener("blur", onWindowBlur);
        frame.removeAttribute(FLOATING_GESTURE_ATTRIBUTE);

        if (!isActive) {
          return;
        }

        ownerDocument.body.style.userSelect = prevStyles.userSelect;
        ownerDocument.documentElement.style.cursor = prevStyles.cursor;

        // A click shouldn't also be handled (e.g. selecting a tab the gesture ended over)
        suppressNextClick(ownerDocument);

        const changes = Object.fromEntries(
          fields.map((field) => [field, Math.round(rect[field])])
        );
        // The tabset may have been docked (or closed) during the gesture (e.g. by app code), in which case there's nothing to change;
        // gestures that are canceled (or blocked; see the onBeforeModelChange prop) move the frame back
        const isChanged =
          shouldCommit &&
          updateModel(gesture === "move" ? "move" : "resize", true, (prev) =>
            getModelIndex(prev).floatingTabsetIds.has(tabsetId)
              ? updateTabset(prev, tabsetId, changes)
              : prev
          );
        if (!isChanged) {
          for (const field of fields) {
            frame.style[STYLE_PROPERTIES[field]] = prevFrameStyles[field] ?? "";
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
          // Canceling a gesture shouldn't also be handled elsewhere (e.g. by closing a dialog the workspace is in)
          if (isActive) {
            keyEvent.preventDefault();
            keyEvent.stopPropagation();
          }

          stop(false);
        }
      };

      // The pointer may be released while the window doesn't have focus (e.g. after switching apps), in which case the release isn't reported
      const onWindowBlur = () => stop(false);

      cancelRef.current = () => stop(false);

      ownerDocument.addEventListener("pointermove", onPointerMove);
      ownerDocument.addEventListener("pointerup", onPointerUp);
      ownerDocument.addEventListener("pointercancel", onPointerCancel);
      ownerDocument.addEventListener("keydown", onKeyDown, true);
      ownerWindow?.addEventListener("blur", onWindowBlur);
    },
    [getMinimumSize, updateModel]
  );
}

const STYLE_PROPERTIES = {
  height: "height",
  width: "width",
  x: "left",
  y: "top"
} as const satisfies { [field in keyof FloatingTabsetRect]: string };

// The parts of a floating tabset's rect that a gesture changes
function getGestureFields(
  gesture: FloatingGesture
): (keyof FloatingTabsetRect)[] {
  if (gesture === "move") {
    return ["x", "y"];
  }

  const fields: (keyof FloatingTabsetRect)[] = [];
  if (gesture.includes("left")) {
    fields.push("x", "width");
  } else if (gesture.includes("right")) {
    fields.push("width");
  }
  if (gesture.includes("top")) {
    fields.push("y", "height");
  } else if (gesture.includes("bottom")) {
    fields.push("height");
  }

  return fields;
}

// The element that positions the floating tabset (rather than that of a floating tabset in a workspace nested within it)
function getFloatingTabsetElement(element: HTMLElement, tabsetId: string) {
  let frame = element.closest<HTMLElement>("[data-floating-tabset]");
  while (frame && frame.dataset.floatingTabset !== tabsetId) {
    frame =
      frame.parentElement?.closest<HTMLElement>("[data-floating-tabset]") ??
      null;
  }

  return frame;
}

// Resizing moves the dragged edges, keeping the tabset at least its minimum size;
// a dragged edge stays within the layout, unless it was already outside of it (e.g. a tabset moved partly out of the way)
function resize(
  start: FloatingTabsetRect,
  edge: FloatingResizeEdge,
  deltaX: number,
  deltaY: number,
  minimumSize: MinimumSize,
  layout: { height: number; width: number }
): FloatingTabsetRect {
  let { height, width, x, y } = start;
  const right = start.x + start.width;
  const bottom = start.y + start.height;

  if (edge.includes("left")) {
    x = Math.max(
      Math.min(start.x + deltaX, right - minimumSize.width),
      Math.min(0, start.x)
    );
    width = right - x;
  } else if (edge.includes("right")) {
    width = Math.min(
      Math.max(start.width + deltaX, minimumSize.width),
      Math.max(layout.width - start.x, start.width)
    );
  }

  if (edge.includes("top")) {
    y = Math.max(
      Math.min(start.y + deltaY, bottom - minimumSize.height),
      Math.min(0, start.y)
    );
    height = bottom - y;
  } else if (edge.includes("bottom")) {
    height = Math.min(
      Math.max(start.height + deltaY, minimumSize.height),
      Math.max(layout.height - start.y, start.height)
    );
  }

  return { height, width, x, y };
}
