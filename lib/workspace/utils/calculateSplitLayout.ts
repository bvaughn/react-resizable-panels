import type { Layout, ResizeItemConstraints } from "../../global/types";
import { calculateDefaultLayout } from "../../global/utils/calculateDefaultLayout";
import { formatLayoutNumber } from "../../global/utils/formatLayoutNumber";

/**
 * The layout a split's Group should have, given the model's sizes:
 * collapsed tabsets take their collapsed sizes, and the expanded children share the rest in proportion to their sizes,
 * within their minimum and maximum sizes (like CSS flex items).
 *
 * ℹ️ Minimum and maximum sizes are applied here (rather than left to the Group, which adjusts one child at a time and may collapse a collapsible child to make room)
 * so that a model whose sizes no longer fit (e.g. one saved in a wider window) is laid out as closely to its sizes as possible;
 * if the children's minimum sizes don't fit, they're left to the Group.
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

  let collapsedTotal = 0;
  const expanded: ResizeItemConstraints[] = [];
  for (const constraints of derivedItemConstraints) {
    if (collapsedItemIds.has(constraints.itemId)) {
      collapsedTotal += constraints.collapsedSize;
    } else {
      expanded.push(constraints);
    }
  }

  const expandedSizes = distribute(
    expanded.map(({ itemId, maxSize, minSize }) => ({
      maxSize,
      minSize,
      weight: defaultLayout[itemId]
    })),
    Math.max(0, 100 - collapsedTotal)
  );

  const layout: Layout = {};
  for (const { collapsedSize, itemId } of derivedItemConstraints) {
    layout[itemId] = formatLayoutNumber(
      collapsedItemIds.has(itemId)
        ? collapsedSize
        : expandedSizes[expanded.findIndex((item) => item.itemId === itemId)]
    );
  }

  return layout;
}

/**
 * Shares space between items in proportion to their weights, within their minimum and maximum sizes;
 * items whose share is outside of their limits are fixed at them, and the rest share what's left (like CSS flex items).
 *
 * ℹ️ If the items' limits can't be met (e.g. their minimum sizes add up to more than the space), they're shared in proportion to their weights.
 */
function distribute(
  items: { maxSize: number; minSize: number; weight: number }[],
  space: number
): number[] {
  const share = (weights: number[], available: number) => {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    return weights.map((weight) =>
      total > 0 ? (weight / total) * available : available / weights.length
    );
  };

  const fixed = new Map<number, number>();
  while (fixed.size < items.length) {
    const flexible = items
      .map((item, index) => ({ ...item, index }))
      .filter(({ index }) => !fixed.has(index));
    const available =
      space - Array.from(fixed.values()).reduce((sum, size) => sum + size, 0);
    const shares = share(
      flexible.map(({ weight }) => weight),
      available
    );

    // Items below their minimums are fixed first if the total adjustment would grow them (and vice versa),
    // so that fixing them doesn't push the remaining items past their other limits
    // (whether an item was clamped to its minimum is based on which way it moved, since an item's minimum and maximum may be equal)
    let adjustment = 0;
    const violations: { index: number; isMinimum: boolean; size: number }[] =
      [];
    flexible.forEach(({ index, maxSize, minSize }, flexibleIndex) => {
      const size = shares[flexibleIndex];
      const clamped = Math.min(maxSize, Math.max(minSize, size));
      if (clamped !== size) {
        adjustment += clamped - size;
        violations.push({ index, isMinimum: clamped > size, size: clamped });
      }
    });

    if (violations.length === 0) {
      flexible.forEach(({ index }, flexibleIndex) =>
        fixed.set(index, shares[flexibleIndex])
      );
      break;
    }

    let fixedCount = 0;
    for (const { index, isMinimum, size } of violations) {
      if (adjustment === 0 || adjustment > 0 === isMinimum) {
        fixed.set(index, size);
        fixedCount++;
      }
    }

    // Each pass fixes at least one item, so the loop always ends
    if (fixedCount === 0) {
      for (const { index, size } of violations) {
        fixed.set(index, size);
      }
    }
  }

  const sizes = items.map((_, index) => fixed.get(index)!);
  const total = sizes.reduce((sum, size) => sum + size, 0);

  // The limits can't be met
  if (Math.abs(total - space) > 0.001) {
    return share(
      items.map(({ weight }) => weight),
      space
    );
  }

  return sizes;
}
