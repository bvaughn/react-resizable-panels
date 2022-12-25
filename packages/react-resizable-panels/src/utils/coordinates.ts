import { Direction, ResizeEvent } from "../types";

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
export function getUpdatedCoordinates(
  event: ResizeEvent,
  prevOffset: number,
  { height, width }: Size,
  direction: Direction
): Coordinates {
  const isHorizontal = direction === "horizontal";
  const size = isHorizontal ? width : height;

  const getMovementBetween = (current: number, prev: number) =>
    prev === 0 ? 0 : current - prev;

  if (isKeyDown(event)) {
    let movement = 0;

    const denominator = event.shiftKey ? 10 : 100;
    const delta = size / denominator;

    switch (event.key) {
      case "ArrowDown":
        movement = delta;
        break;
      case "ArrowLeft":
        movement = -delta;
        break;
      case "ArrowRight":
        movement = delta;
        break;
      case "ArrowUp":
        movement = -delta;
        break;
      case "End":
        if (isHorizontal) {
          movement = size;
        } else {
          movement = size;
        }
        break;
      case "Home":
        if (isHorizontal) {
          movement = -size;
        } else {
          movement = -size;
        }
        break;
    }

    // Estimate screen X/Y to be the center of the resize handle.
    // Otherwise the first mouse/touch event after a keyboard event will appear to "jump"
    let offset = 0;
    if (document.activeElement) {
      const rect = document.activeElement.getBoundingClientRect();
      offset = isHorizontal
        ? rect.left + rect.width / 2
        : rect.top + rect.height / 2;
    }

    return {
      movement,
      offset,
    };
  } else if (isTouchMoveEvent(event)) {
    const firstTouch = event.touches[0];

    const offset = isHorizontal ? firstTouch.screenX : firstTouch.screenY;
    const movement = getMovementBetween(offset, prevOffset);

    return { movement, offset };
  } else if (isMouseMoveEvent(event)) {
    const offset = isHorizontal ? event.screenX : event.screenY;
    const movement = getMovementBetween(offset, prevOffset);

    return { movement, offset };
  } else {
    throw Error(`Unsupported event type: "${(event as any).type}"`);
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
