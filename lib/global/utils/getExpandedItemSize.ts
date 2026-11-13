import { formatLayoutNumber } from "./formatLayoutNumber";
import type { GroupResizeBehavior } from "../../flex/types";

/**
 * Returns the size (as a percentage of the current axis size) to restore a collapsed item to.
 *
 * "preserve-pixel-size" items are restored to their pre-collapse pixel size,
 * even if the axis has been resized since the item was collapsed.
 * Other items are restored to their pre-collapse percentage.
 *
 * Note that this uses the item's current resize behavior (not the one it had when it was collapsed);
 * changing the behavior while an item is collapsed is rare enough that the mismatch is accepted.
 */
export function getExpandedItemSize({
  axisSize,
  expanded,
  groupResizeBehavior
}: {
  axisSize: number;
  expanded: { axisSize: number; size: number };
  groupResizeBehavior: GroupResizeBehavior | undefined;
}): number {
  if (
    groupResizeBehavior !== "preserve-pixel-size" ||
    expanded.axisSize <= 0 ||
    axisSize <= 0 ||
    expanded.axisSize === axisSize
  ) {
    return expanded.size;
  }

  return formatLayoutNumber((expanded.size * expanded.axisSize) / axisSize);
}
