import { ResizeEvent } from "../types";

export type Coordinates = {
  screenX: number;
  screenY: number;
};

export type Movement = {
  movementX: number;
  movementY: number;
};

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/movementX
export function getUpdatedCoordinates(
  event: ResizeEvent,
  prevCoordinates: Coordinates
): Coordinates & Movement {
  const { screenX: prevScreenX, screenY: prevScreenY } = prevCoordinates;

  const getMovementBetween = (current: number, prev: number) =>
    prev === 0 ? 0 : current - prev;

  if (isTouchMoveEvent(event)) {
    const firstTouch = event.touches[0];

    return {
      movementX: getMovementBetween(firstTouch.screenX, prevScreenX),
      movementY: getMovementBetween(firstTouch.screenY, prevScreenY),
      screenX: firstTouch.screenX,
      screenY: firstTouch.screenY,
    };
  }

  return {
    movementX: getMovementBetween(event.screenX, prevScreenX),
    movementY: getMovementBetween(event.screenY, prevScreenY),
    screenX: event.screenX,
    screenY: event.screenY,
  };
}

export function isTouchMoveEvent(event: ResizeEvent): event is TouchEvent {
  return event.type === "touchmove";
}
