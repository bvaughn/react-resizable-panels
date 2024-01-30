import { ResizeEvent } from "../../types";
import { isMouseEvent, isTouchEvent } from ".";

export function getResizeEventCoordinates(event: ResizeEvent) {
  if (isMouseEvent(event)) {
    return {
      x: event.pageX,
      y: event.pageY,
    };
  } else if (isTouchEvent(event)) {
    const touch = event.touches[0];
    if (touch && touch.pageX && touch.pageY) {
      return {
        x: touch.pageX,
        y: touch.pageY,
      };
    }
  }

  return {
    x: Infinity,
    y: Infinity,
  };
}
