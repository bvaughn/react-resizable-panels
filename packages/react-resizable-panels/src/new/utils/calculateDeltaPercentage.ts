import { getPanelGroup } from "../../utils/group";
import { DragState, ResizeEvent } from "../PanelGroupContext";
import { Direction } from "../types";
import { isKeyDown } from "./events";
import { calculateDragOffsetPercentage } from "./calculateDragOffsetPercentage";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/movementX
export function calculateDeltaPercentage(
  event: ResizeEvent,
  groupId: string,
  dragHandleId: string,
  direction: Direction,
  initialDragState: DragState
): number {
  if (isKeyDown(event)) {
    const isHorizontal = direction === "horizontal";

    const groupElement = getPanelGroup(groupId)!;
    const rect = groupElement.getBoundingClientRect();
    const groupSizeInPixels = isHorizontal ? rect.width : rect.height;

    const denominator = event.shiftKey ? 10 : 100;
    const delta = groupSizeInPixels / denominator;

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
        movement = groupSizeInPixels;
        break;
      case "Home":
        movement = -groupSizeInPixels;
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
