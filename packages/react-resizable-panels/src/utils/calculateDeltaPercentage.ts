import { DragState, ResizeEvent } from "../PanelGroupContext";
import { Direction } from "../types";
import { calculateDragOffsetPercentage } from "./calculateDragOffsetPercentage";
import { isKeyDown } from "./events";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/movementX
export function calculateDeltaPercentage(
  event: ResizeEvent,
  dragHandleId: string,
  direction: Direction,
  initialDragState: DragState,
  keyboardResizeBy: number | null
): number {
  if (isKeyDown(event)) {
    const isHorizontal = direction === "horizontal";

    let delta = 0;
    if (event.shiftKey) {
      delta = 100;
    } else if (keyboardResizeBy != null) {
      delta = keyboardResizeBy;
    } else {
      delta = 10;
    }

    let movement = 0;
    switch (event.key) {
      case "ArrowDown":
        movement = isHorizontal ? 0 : delta;
        break;
      case "ArrowLeft":
        movement = isHorizontal ? -delta : 0;
        break;
      case "ArrowRight":
        movement = isHorizontal ? delta : 0;
        break;
      case "ArrowUp":
        movement = isHorizontal ? 0 : -delta;
        break;
      case "End":
        movement = 100;
        break;
      case "Home":
        movement = -100;
        break;
    }

    return movement;
  } else {
    return calculateDragOffsetPercentage(
      event,
      dragHandleId,
      direction,
      initialDragState
    );
  }
}
