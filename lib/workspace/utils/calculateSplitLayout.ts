import type { Layout, ResizeItemConstraints } from "../../global/types";
import { calculateDefaultLayout } from "../../global/utils/calculateDefaultLayout";
import { formatLayoutNumber } from "../../global/utils/formatLayoutNumber";

/**
 * The layout a split's Group should have, given the model's sizes:
 * collapsed tabsets take their collapsed sizes, and the expanded children share the rest in proportion to their sizes.
 *
 * ℹ️ Percentage sizes are read from the model (the Group's constraints can lag behind it, e.g. right after a tabset expands);
 * other sizes (e.g. "250px") come from the Panels' default sizes, which the Group has converted to percentages.
 */
export function calculateSplitLayout(
  derivedItemConstraints: ResizeItemConstraints[],
  collapsedItemIds: Set<string>,
  sizes: { [itemId: string]: number | string | undefined }
): Layout {
  const defaultLayout = calculateDefaultLayout(
    derivedItemConstraints.map((constraints) => {
      const size = sizes[constraints.itemId];
      return typeof size === "number"
        ? { ...constraints, defaultSize: size }
        : constraints;
    })
  );
  if (collapsedItemIds.size === 0) {
    return defaultLayout;
  }

  let collapsedTotal = 0;
  let expandedTotal = 0;
  let expandedCount = 0;
  for (const { collapsedSize, itemId } of derivedItemConstraints) {
    if (collapsedItemIds.has(itemId)) {
      collapsedTotal += collapsedSize;
    } else {
      expandedTotal += defaultLayout[itemId];
      expandedCount++;
    }
  }

  const available = Math.max(0, 100 - collapsedTotal);
  const layout: Layout = {};
  for (const { collapsedSize, itemId } of derivedItemConstraints) {
    if (collapsedItemIds.has(itemId)) {
      layout[itemId] = formatLayoutNumber(collapsedSize);
    } else {
      layout[itemId] = formatLayoutNumber(
        expandedTotal > 0
          ? (defaultLayout[itemId] / expandedTotal) * available
          : available / expandedCount
      );
    }
  }

  return layout;
}
