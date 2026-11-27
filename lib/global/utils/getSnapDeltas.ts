import type { Layout, ResizeItemConstraints } from "../types";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { isSnapLayoutAllowed } from "./isSnapLayoutAllowed";
import { layoutNumbersEqual } from "./layoutNumbersEqual";

/**
 * Separator deltas (percentages) that resize one of the items on either side of a separator to one of its snap sizes.
 * Collapsible items with snap sizes can also snap to their collapsed size.
 *
 * Deltas are excluded if the item would not end up at the snap size (e.g. because of its own or another item's constraints),
 * if the resize would push another (non-adjacent) item with snap sizes off of them,
 * or (if `snapToCollapsedSize` is false) if the resize would collapse or expand any item.
 * An empty array means that neither item has snap sizes (or none that are possible).
 *
 * Only the item before (or after) the separator is snapped if `side` is specified.
 *
 * If `snapToCollapsedSize` is false, expanded items don't snap to their collapsed sizes
 * and collapsed items stay collapsed (their only snap delta is 0).
 */
export function getSnapDeltas({
  initialLayout,
  itemConstraints,
  pivotIndices,
  side,
  snapToCollapsedSize = true,
  trigger
}: {
  initialLayout: Layout;
  itemConstraints: ResizeItemConstraints[];
  pivotIndices: number[];
  side?: "after" | "before" | undefined;
  snapToCollapsedSize?: boolean | undefined;
  trigger: "imperative-api" | "keyboard" | "mouse-or-touch";
}): number[] {
  const deltas: number[] = [];

  // A positive delta grows the item before the separator and shrinks the item after it
  const [firstPivotIndex, secondPivotIndex] = pivotIndices;
  const pivots = [
    { index: firstPivotIndex, side: "before", sign: 1 },
    { index: secondPivotIndex, side: "after", sign: -1 }
  ].filter((pivot) => side === undefined || pivot.side === side);

  for (const { index, sign } of pivots) {
    const constraints = itemConstraints[index];
    if (!constraints?.snapSizes?.length) {
      continue;
    }

    const { collapsedSize, collapsible, itemId, snapSizes } = constraints;
    const initialSize = initialLayout[itemId];
    let sizes = snapSizes;
    if (collapsible) {
      if (snapToCollapsedSize) {
        sizes = [...snapSizes, collapsedSize];
      } else if (layoutNumbersEqual(initialSize, collapsedSize)) {
        sizes = [collapsedSize];
      }
    }

    for (const size of sizes) {
      const delta = sign * (size - initialSize);
      if (deltas.some((current) => layoutNumbersEqual(current, delta))) {
        continue;
      }

      const layout = adjustLayoutByDelta({
        delta,
        initialLayout,
        itemConstraints,
        pivotIndices,
        prevLayout: initialLayout,
        trigger
      });
      if (
        layoutNumbersEqual(layout[itemId], size) &&
        isSnapLayoutAllowed({
          initialLayout,
          itemConstraints,
          layout,
          pivotIndices,
          snapToCollapsedSize
        })
      ) {
        deltas.push(delta);
      }
    }
  }

  return deltas;
}
