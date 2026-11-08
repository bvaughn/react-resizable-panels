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

  // The observed border box size is exact (not rounded) and in layout pixels, like the offset size:
  // it ignores transforms and CSS `zoom` (checked in Chrome, Firefox, and Safari; see #804).
  // It's only used when it agrees with the offset size, e.g. not in a vertical writing mode (where its inline size is the element's height)
  const exactItemSize =
    axis.orientation === "horizontal"
      ? resizeObserverSize.inlineSize
      : resizeObserverSize.blockSize;
  const itemSizeForPercentage =
    Number.isFinite(exactItemSize) &&
    exactItemSize > 0 &&
    Math.abs(exactItemSize - itemSize) < 1
      ? exactItemSize
      : itemSize;

  const prevSize = item.mutableValues.prevSize;
  const nextSize = {
    asPercentage: formatLayoutNumber((itemSizeForPercentage / axisSize) * 100),
    // Rounded, for compatibility
    inPixels: itemSize
  };
  item.mutableValues.prevSize = nextSize;

  item.onResize(nextSize, item.id, prevSize);
}
