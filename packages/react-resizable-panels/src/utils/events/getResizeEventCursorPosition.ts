import { ResizeEvent } from "../../PanelGroupContext";
import { Direction } from "../../types";
import { getResizeEventCoordinates } from "./getResizeEventCoordinates";

export function getResizeEventCursorPosition(
  direction: Direction,
  event: ResizeEvent
): number {
  const isHorizontal = direction === "horizontal";

  const { x, y } = getResizeEventCoordinates(event);

  return isHorizontal ? x : y;
}
