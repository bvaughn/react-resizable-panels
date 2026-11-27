import type { Layout, ResizeItemConstraints } from "../types";
import { layoutNumbersEqual } from "./layoutNumbersEqual";

/**
 * Whether a layout that snaps one item is acceptable for the other items:
 * - Items other than the pivots (e.g. items that were pushed by a cascading resize) can only move to one of their own snap sizes.
 * - If `snapToCollapsedSize` is false, no item can be collapsed or expanded.
 */
export function isSnapLayoutAllowed({
  initialLayout,
  itemConstraints,
  layout,
  pivotIndices,
  snapToCollapsedSize
}: {
  initialLayout: Layout;
  itemConstraints: ResizeItemConstraints[];
  layout: Layout;
  pivotIndices: number[];
  snapToCollapsedSize: boolean;
}) {
  return itemConstraints.every((constraints, index) => {
    const { collapsedSize, collapsible, itemId, snapSizes } = constraints;
    const initialSize = initialLayout[itemId];
    const size = layout[itemId];
    if (layoutNumbersEqual(initialSize, size)) {
      return true;
    }

    if (
      !snapToCollapsedSize &&
      collapsible &&
      layoutNumbersEqual(initialSize, collapsedSize) !==
        layoutNumbersEqual(size, collapsedSize)
    ) {
      return false;
    }

    if (!pivotIndices.includes(index) && snapSizes?.length) {
      return (
        snapSizes.some((snapSize) => layoutNumbersEqual(snapSize, size)) ||
        (collapsible && layoutNumbersEqual(size, collapsedSize))
      );
    }

    return true;
  });
}
