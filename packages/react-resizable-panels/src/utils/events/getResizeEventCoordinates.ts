import { ResizeEvent } from "../../types";
import { isMouseEvent, isPointerEvent } from ".";

export function getResizeEventCoordinates(event: ResizeEvent) {
  if (isPointerEvent(event)) {
    if (event.isPrimary) {
      return {
        x: event.clientX,
        y: event.clientY,
      };
    }
  } else if (isMouseEvent(event)) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  return {
    x: Infinity,
    y: Infinity,
  };
}
