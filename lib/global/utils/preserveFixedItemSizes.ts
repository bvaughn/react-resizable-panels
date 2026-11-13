import { formatLayoutNumber } from "./formatLayoutNumber";
import { getItemResizeBehaviors } from "./getItemResizeBehaviors";
import type { GroupResizeBehavior } from "../../flex/types";
import type { Layout, RegisteredResizeAxis } from "../types";

/**
 * Converts a layout measured at prevAxisSize to nextAxisSize,
 * keeping "preserve-pixel-size" items at the same pixel size and scaling the other items to fill the remaining space.
 *
 * The items' resize behaviors default to the axis' current ones;
 * pass resizeBehaviors (in item order) to convert using the behaviors a layout was recorded with instead.
 */
export function preserveFixedItemSizes({
  axis,
  nextAxisSize,
  prevAxisSize,
  prevLayout,
  resizeBehaviors = getItemResizeBehaviors(axis)
}: {
  axis: RegisteredResizeAxis;
  nextAxisSize: number;
  prevAxisSize: number;
  prevLayout: Layout;
  resizeBehaviors?: GroupResizeBehavior[];
}) {
  if (prevAxisSize <= 0 || nextAxisSize <= 0 || prevAxisSize === nextAxisSize) {
    return prevLayout;
  }

  let fixedItemsTotalSize = 0;
  let flexibleItemsTotalPrevSize = 0;
  let hasPreservePixelSizeItems = false;

  const fixedItems = new Map<string, number>();
  const flexibleItemIds: string[] = [];

  axis.items.forEach((item, index) => {
    const prevItemSize = prevLayout[item.id] ?? 0;
    switch (resizeBehaviors[index]) {
      case "preserve-pixel-size": {
        hasPreservePixelSizeItems = true;

        const prevItemSizeInPixels = (prevItemSize / 100) * prevAxisSize;
        const nextItemSize = formatLayoutNumber(
          (prevItemSizeInPixels / nextAxisSize) * 100
        );

        fixedItems.set(item.id, nextItemSize);
        fixedItemsTotalSize += nextItemSize;
        break;
      }
      case "preserve-relative-size":
      default: {
        flexibleItemIds.push(item.id);
        flexibleItemsTotalPrevSize += prevItemSize;
        break;
      }
    }
  });

  if (!hasPreservePixelSizeItems || flexibleItemIds.length === 0) {
    return prevLayout;
  }

  const remainingSize = 100 - fixedItemsTotalSize;
  const nextLayout = { ...prevLayout };

  fixedItems.forEach((size, itemId) => {
    nextLayout[itemId] = size;
  });

  if (flexibleItemsTotalPrevSize > 0) {
    for (const itemId of flexibleItemIds) {
      const prevSize = prevLayout[itemId] ?? 0;
      nextLayout[itemId] = formatLayoutNumber(
        (prevSize / flexibleItemsTotalPrevSize) * remainingSize
      );
    }
  } else {
    const evenSize = formatLayoutNumber(remainingSize / flexibleItemIds.length);
    for (const itemId of flexibleItemIds) {
      nextLayout[itemId] = evenSize;
    }
  }

  return nextLayout;
}
