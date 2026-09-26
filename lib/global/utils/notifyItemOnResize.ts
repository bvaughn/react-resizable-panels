import { calculateAvailableAxisSize } from "../dom/calculateAvailableAxisSize";
import type { RegisteredResizeAxis } from "../types";
import { formatLayoutNumber } from "./formatLayoutNumber";

export function notifyItemOnResize(
  axis: RegisteredResizeAxis,
  element: HTMLElement,
  borderBoxSize: readonly ResizeObserverSize[]
) {
  const resizeObserverSize = borderBoxSize[0];
  if (!resizeObserverSize) {
    return;
  }

  const item = axis.items.find((current) => current.element === element);
  if (!item || !item.onResize) {
    return;
  }

  const axisSize = calculateAvailableAxisSize({ axis });

  const itemSize =
    axis.orientation === "horizontal"
      ? item.element.offsetWidth
      : item.element.offsetHeight;

  const prevSize = item.mutableValues.prevSize;
  const nextSize = {
    asPercentage: formatLayoutNumber((itemSize / axisSize) * 100),
    inPixels: itemSize
  };
  item.mutableValues.prevSize = nextSize;

  item.onResize(nextSize, item.id, prevSize);
}
