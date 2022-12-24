import { Direction, ResizeEvent } from "../types";

export type Coordinates = {
  screenX: number;
  screenY: number;
};

export type Dimensions = {
  height: number;
  width: number;
};

export type Movement = {
  movementX: number;
  movementY: number;
};

const element = document.createElement("div");
element.getBoundingClientRect();

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/movementX
export function getUpdatedCoordinates(
  event: ResizeEvent,
  prevCoordinates: Coordinates,
  dimensions: Dimensions,
  direction: Direction
): Coordinates & Movement {
  const { screenX: prevScreenX, screenY: prevScreenY } = prevCoordinates;
  const { height, width } = dimensions;

  const getMovementBetween = (current: number, prev: number) =>
    prev === 0 ? 0 : current - prev;

  if (isKeyDown(event)) {
    let movementX = 0;
    let movementY = 0;

    const size = direction === "horizontal" ? width : height;
    const denominator = event.shiftKey ? 10 : 100;
    const delta = size / denominator;

    switch (event.key) {
      case "ArrowDown":
        movementY = delta;
        break;
      case "ArrowLeft":
        movementX = -delta;
        break;
      case "ArrowRight":
        movementX = delta;
        break;
      case "ArrowUp":
        movementY = -delta;
        break;
      case "End":
        if (direction === "horizontal") {
          movementX = size;
        } else {
          movementY = size;
        }
        break;
      case "Home":
        if (direction === "horizontal") {
          movementX = -size;
        } else {
          movementY = -size;
        }
        break;
    }

    // Estimate screen X/Y to be the center of the resize handle.
    // Otherwise the first mouse/touch event after a keyboard event will appear to "jump"
    let screenX = 0;
    let screenY = 0;
    if (document.activeElement) {
      const rect = document.activeElement.getBoundingClientRect();
      screenX = rect.left + rect.width / 2;
      screenY = rect.top + rect.height / 2;
    }

    return {
      movementX,
      movementY,
      screenX,
      screenY,
    };
  } else if (isTouchMoveEvent(event)) {
    const firstTouch = event.touches[0];

    return {
      movementX: getMovementBetween(firstTouch.screenX, prevScreenX),
      movementY: getMovementBetween(firstTouch.screenY, prevScreenY),
      screenX: firstTouch.screenX,
      screenY: firstTouch.screenY,
    };
  } else if (isMouseMoveEvent(event)) {
    return {
      movementX: getMovementBetween(event.screenX, prevScreenX),
      movementY: getMovementBetween(event.screenY, prevScreenY),
      screenX: event.screenX,
      screenY: event.screenY,
    };
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
