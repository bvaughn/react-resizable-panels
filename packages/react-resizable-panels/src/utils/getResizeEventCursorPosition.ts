import { ResizeEvent } from "../PanelGroupContext";
import { Direction } from "../types";
import { assert } from "./assert";
import { isMouseEvent, isTouchEvent } from "./events";

export function getResizeEventCursorPosition(
  direction: Direction,
  event: ResizeEvent
): number {
  const isHorizontal = direction === "horizontal";

  if (isMouseEvent(event)) {
    return isHorizontal ? event.clientX : event.clientY;
  } else if (isTouchEvent(event)) {
    const firstTouch = event.touches[0];
    assert(firstTouch);
    return isHorizontal ? firstTouch.screenX : firstTouch.screenY;
  } else {
    throw Error(`Unsupported event type "${event.type}"`);
  }
}
