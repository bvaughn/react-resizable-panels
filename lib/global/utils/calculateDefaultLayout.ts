import { formatLayoutNumber } from "./formatLayoutNumber";
import type { Layout, ResizeItemConstraints } from "../types";

export function calculateDefaultLayout(
  derivedItemConstraints: ResizeItemConstraints[]
): Layout {
  let explicitCount = 0;
  let total = 0;

  const layout: Layout = {};

  for (const current of derivedItemConstraints) {
    if (current.defaultSize !== undefined) {
      explicitCount++;

      const size = formatLayoutNumber(current.defaultSize);

      total += size;
      layout[current.itemId] = size;
    } else {
      // @ts-expect-error Add panel keys in order to simplify traversal elsewhere; we'll fill them in in the loop below
      layout[current.itemId] = undefined;
    }
  }

  const remainingItemCount = derivedItemConstraints.length - explicitCount;
  if (remainingItemCount !== 0) {
    const size = formatLayoutNumber((100 - total) / remainingItemCount);

    for (const current of derivedItemConstraints) {
      if (current.defaultSize === undefined) {
        layout[current.itemId] = size;
      }
    }
  }

  return layout;
}
