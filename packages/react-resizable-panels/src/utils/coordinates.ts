import { Direction, ResizeEvent } from "../types";
import { getResizeHandle } from "./group";

export type Coordinates = {
  movement: number;
  offset: number;
};

export type Size = {
  height: number;
  width: number;
};

const element = document.createElement("div");
element.getBoundingClientRect();

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/movementX
export function getMovement(
  event: ResizeEvent,
  handleId: string,
  { height, width }: Size,
  direction: Direction
): number {
  const isHorizontal = direction === "horizontal";
  const size = isHorizontal ? width : height;

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
    const handleElement = getResizeHandle(handleId)!;
    const rect = handleElement.getBoundingClientRect();
    const elementOffset = isHorizontal ? rect.left : rect.top;

    let pointerOffset = 0;
    if (isMouseMoveEvent(event)) {
      pointerOffset = isHorizontal ? event.clientX : event.clientY;
    } else {
      const firstTouch = event.touches[0];
      pointerOffset = isHorizontal ? firstTouch.screenX : firstTouch.screenY;
    }

    return pointerOffset - elementOffset;
  }
}

export function isKeyDown(event: ResizeEvent): event is KeyboardEvent {
  return event.type === "keydown";
}

export function isMouseMoveEvent(event: ResizeEvent): event is MouseEvent {
  return event.type === "mousemove";
}

export function isTouchMoveEvent(event: ResizeEvent): event is TouchEvent {
  return event.type === "touchmove";
}
