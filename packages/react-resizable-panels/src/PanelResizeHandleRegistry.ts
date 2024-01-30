import { Direction, ResizeEvent } from "./types";
import { resetGlobalCursorStyle, setGlobalCursorStyle } from "./utils/cursor";
import { getResizeEventCoordinates } from "./utils/events/getResizeEventCoordinates";
import { getInputType } from "./utils/getInputType";

export type ResizeHandlerAction = "down" | "move" | "up";
export type ResizeHandlerState = "drag" | "hover" | "inactive";
export type SetResizeHandlerState = (
  action: ResizeHandlerAction,
  state: ResizeHandlerState,
  event: ResizeEvent
) => void;

export type PointerHitAreaMargins = {
  coarse: number;
  fine: number;
};

export type ResizeHandlerData = {
  direction: Direction;
  element: HTMLElement;
  hitAreaMargins: PointerHitAreaMargins;
  setResizeHandlerState: SetResizeHandlerState;
};

export const EXCEEDED_HORIZONTAL_MIN = 0b0001;
export const EXCEEDED_HORIZONTAL_MAX = 0b0010;
export const EXCEEDED_VERTICAL_MIN = 0b0100;
export const EXCEEDED_VERTICAL_MAX = 0b1000;

const isCoarsePointer = getInputType() === "coarse";

let intersectingHandles: ResizeHandlerData[] = [];
let isPointerDown = false;
let ownerDocumentCounts: Map<Document, number> = new Map();
let panelConstraintFlags: Map<string, number> = new Map();

const registeredResizeHandlers = new Set<ResizeHandlerData>();

export function registerResizeHandle(
  resizeHandleId: string,
  element: HTMLElement,
  direction: Direction,
  hitAreaMargins: PointerHitAreaMargins,
  setResizeHandlerState: SetResizeHandlerState
) {
  const { ownerDocument } = element;

  const data: ResizeHandlerData = {
    direction,
    element,
    hitAreaMargins,
    setResizeHandlerState,
  };

  const count = ownerDocumentCounts.get(ownerDocument) ?? 0;
  ownerDocumentCounts.set(ownerDocument, count + 1);

  registeredResizeHandlers.add(data);

  updateListeners();

  return function unregisterResizeHandle() {
    panelConstraintFlags.delete(resizeHandleId);
    registeredResizeHandlers.delete(data);

    const count = ownerDocumentCounts.get(ownerDocument) ?? 1;
    ownerDocumentCounts.set(ownerDocument, count - 1);

    updateListeners();

    if (count === 1) {
      ownerDocumentCounts.delete(ownerDocument);
    }
  };
}

function handlePointerDown(event: ResizeEvent) {
  const { x, y } = getResizeEventCoordinates(event);

  isPointerDown = true;

  recalculateIntersectingHandles({ x, y });
  updateListeners();

  if (intersectingHandles.length > 0) {
    updateResizeHandlerStates("down", event);

    event.preventDefault();
  }
}

function handlePointerMove(event: ResizeEvent) {
  const { x, y } = getResizeEventCoordinates(event);

  if (isPointerDown) {
    intersectingHandles.forEach((data) => {
      const { setResizeHandlerState } = data;

      setResizeHandlerState("move", "drag", event);
    });

    // Update cursor based on return value(s) from active handles
    updateCursor();
  } else {
    recalculateIntersectingHandles({ x, y });
    updateResizeHandlerStates("move", event);
    updateCursor();
  }

  if (intersectingHandles.length > 0) {
    event.preventDefault();
  }
}

function handlePointerUp(event: ResizeEvent) {
  const { x, y } = getResizeEventCoordinates(event);

  panelConstraintFlags.clear();
  isPointerDown = false;

  if (intersectingHandles.length > 0) {
    event.preventDefault();
  }

  recalculateIntersectingHandles({ x, y });
  updateResizeHandlerStates("up", event);
  updateCursor();

  updateListeners();
}

function recalculateIntersectingHandles({ x, y }: { x: number; y: number }) {
  intersectingHandles.splice(0);

  registeredResizeHandlers.forEach((data) => {
    const { element, hitAreaMargins } = data;
    const { bottom, left, right, top } = element.getBoundingClientRect();

    const margin = isCoarsePointer
      ? hitAreaMargins.coarse
      : hitAreaMargins.fine;

    const intersects =
      x >= left - margin &&
      x <= right + margin &&
      y >= top - margin &&
      y <= bottom + margin;

    if (intersects) {
      intersectingHandles.push(data);
    }
  });
}

export function reportConstraintsViolation(
  resizeHandleId: string,
  flag: number
) {
  panelConstraintFlags.set(resizeHandleId, flag);
}

function updateCursor() {
  let intersectsHorizontal = false;
  let intersectsVertical = false;

  intersectingHandles.forEach((data) => {
    const { direction } = data;

    if (direction === "horizontal") {
      intersectsHorizontal = true;
    } else {
      intersectsVertical = true;
    }
  });

  let constraintFlags = 0;
  panelConstraintFlags.forEach((flag) => {
    constraintFlags |= flag;
  });

  if (intersectsHorizontal && intersectsVertical) {
    setGlobalCursorStyle("intersection", constraintFlags);
  } else if (intersectsHorizontal) {
    setGlobalCursorStyle("horizontal", constraintFlags);
  } else if (intersectsVertical) {
    setGlobalCursorStyle("vertical", constraintFlags);
  } else {
    resetGlobalCursorStyle();
  }
}

function updateListeners() {
  ownerDocumentCounts.forEach((_, ownerDocument) => {
    const { body } = ownerDocument;

    body.removeEventListener("contextmenu", handlePointerUp);
    body.removeEventListener("mousedown", handlePointerDown);
    body.removeEventListener("mouseleave", handlePointerMove);
    body.removeEventListener("mousemove", handlePointerMove);
    body.removeEventListener("touchmove", handlePointerMove);
    body.removeEventListener("touchstart", handlePointerDown);
  });

  window.removeEventListener("mouseup", handlePointerUp);
  window.removeEventListener("touchcancel", handlePointerUp);
  window.removeEventListener("touchend", handlePointerUp);

  if (registerResizeHandle.length > 0) {
    if (isPointerDown) {
      if (intersectingHandles.length > 0) {
        ownerDocumentCounts.forEach((count, ownerDocument) => {
          const { body } = ownerDocument;

          if (count > 0) {
            body.addEventListener("contextmenu", handlePointerUp);
            body.addEventListener("mouseleave", handlePointerMove);
            body.addEventListener("mousemove", handlePointerMove);
            body.addEventListener("touchmove", handlePointerMove, {
              passive: false,
            });
          }
        });
      }

      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchcancel", handlePointerUp);
      window.addEventListener("touchend", handlePointerUp);
    } else {
      ownerDocumentCounts.forEach((count, ownerDocument) => {
        const { body } = ownerDocument;

        if (count > 0) {
          body.addEventListener("mousedown", handlePointerDown);
          body.addEventListener("mousemove", handlePointerMove);
          body.addEventListener("touchmove", handlePointerMove, {
            passive: false,
          });
          body.addEventListener("touchstart", handlePointerDown);
        }
      });
    }
  }
}

function updateResizeHandlerStates(
  action: ResizeHandlerAction,
  event: ResizeEvent
) {
  registeredResizeHandlers.forEach((data) => {
    const { setResizeHandlerState } = data;

    if (intersectingHandles.includes(data)) {
      if (isPointerDown) {
        setResizeHandlerState(action, "drag", event);
      } else {
        setResizeHandlerState(action, "hover", event);
      }
    } else {
      setResizeHandlerState(action, "inactive", event);
    }
  });
}
