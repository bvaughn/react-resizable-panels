import { Direction, ResizeEvent } from "../types";
import { getPanelGroup, getResizeHandle } from "./group";

export type Coordinates = {
  movement: number;
  offset: number;
};

export type Size = {
  height: number;
  width: number;
};

export function getDragOffset(
  event: ResizeEvent,
  handleId: string,
  direction: Direction,
  initialOffset: number = 0
): number {
  const isHorizontal = direction === "horizontal";

  let pointerOffset = 0;
  if (isMouseEvent(event)) {
    pointerOffset = isHorizontal ? event.clientX : event.clientY;
  } else if (isTouchEvent(event)) {
    const firstTouch = event.touches[0];
    pointerOffset = isHorizontal ? firstTouch.screenX : firstTouch.screenY;
  } else {
    return 0;
  }

  const handleElement = getResizeHandle(handleId);
  const rect = handleElement.getBoundingClientRect();
  const elementOffset = isHorizontal ? rect.left : rect.top;

  return pointerOffset - elementOffset - initialOffset;
}

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/movementX
export function getMovement(
  event: ResizeEvent,
  groupId: string,
  handleId: string,
  direction: Direction,
  initialOffset: number
): number {
  const isHorizontal = direction === "horizontal";

  const groupElement = getPanelGroup(groupId);
  const rect = groupElement.getBoundingClientRect();
  const size = isHorizontal ? rect.width : rect.height;

  if (isKeyDown(event)) {
    const denominator = event.shiftKey ? 10 : 100;
    const delta = size / denominator;

    switch (event.key) {
      case "ArrowDown":
        return delta;
      case "ArrowLeft":
        return -delta;
      case "ArrowRight":
        return delta;
      case "ArrowUp":
        return -delta;
      case "End":
        if (isHorizontal) {
          return size;
        } else {
          return size;
        }
      case "Home":
        if (isHorizontal) {
          return -size;
        } else {
          return -size;
        }
    }
  } else {
    return getDragOffset(event, handleId, direction, initialOffset);
  }
}

export function isKeyDown(event: ResizeEvent): event is KeyboardEvent {
  return event.type === "keydown";
}

export function isMouseEvent(event: ResizeEvent): event is MouseEvent {
  return event.type.startsWith("mouse");
}

export function isTouchEvent(event: ResizeEvent): event is TouchEvent {
  return event.type.startsWith("touch");
}
