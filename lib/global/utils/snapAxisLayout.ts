import type { Layout, ResizeItemConstraints } from "../types";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { findNearestValue } from "./findNearestValue";
import { getSnapDeltas } from "./getSnapDeltas";

/**
 * Moves items with snap sizes to their nearest snap sizes (as closely as their constraints allow)
 * by moving the boundaries between items, one at a time, from first to last.
 * Each boundary snaps the item before it (the last boundary can also snap the item after it),
 * so boundaries that have already been snapped are not moved again.
 *
 * Snapping doesn't collapse or expand items: collapsed items stay collapsed, and expanded items only snap to their snap sizes
 * (whether an item is collapsed is decided by validateAxisLayout, from its min size and collapsed threshold).
 *
 * All units must be in percentages and the layout must already be valid (see validateAxisLayout).
 */
export function snapAxisLayout({
  itemConstraints,
  layout
}: {
  itemConstraints: ResizeItemConstraints[];
  layout: Layout;
}): Layout {
  if (!itemConstraints.some((constraints) => constraints.snapSizes?.length)) {
    return layout;
  }

  let nextLayout = layout;

  for (let index = 0; index < itemConstraints.length - 1; index++) {
    const pivotIndices = [index, index + 1];
    const isLastBoundary = index === itemConstraints.length - 2;

    for (const side of isLastBoundary
      ? (["before", "after"] as const)
      : (["before"] as const)) {
      const snapDeltas = getSnapDeltas({
        initialLayout: nextLayout,
        itemConstraints,
        pivotIndices,
        side,
        snapToCollapsedSize: false,
        trigger: "imperative-api"
      });

      const delta = findNearestValue(snapDeltas, 0);
      if (delta !== undefined) {
        nextLayout = adjustLayoutByDelta({
          delta,
          initialLayout: nextLayout,
          itemConstraints,
          pivotIndices,
          prevLayout: nextLayout,
          trigger: "imperative-api"
        });
        break;
      }
    }
  }

  return nextLayout;
}
