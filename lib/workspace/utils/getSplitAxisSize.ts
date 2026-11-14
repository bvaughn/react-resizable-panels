import { calculateAvailableAxisSize } from "../../global/dom/calculateAvailableAxisSize";
import { getMountedAxes } from "../../global/mutable-state/axes";

/**
 * The space (in layout pixels) that a split's children share, which is what their percentage sizes are relative to
 * (it doesn't include separators or gaps, unlike the split's element). It's measured as the split is currently rendered.
 *
 * Returns undefined if the split isn't mounted (the id is its Group's, see SplitView), or has no size.
 */
export function getSplitAxisSize(
  groupId: string,
  orientation?: "horizontal" | "vertical"
): number | undefined {
  for (const axis of getMountedAxes().keys()) {
    if (
      axis.id === groupId &&
      (orientation === undefined || axis.orientation === orientation)
    ) {
      const size = calculateAvailableAxisSize({ axis });
      return size > 0 ? size : undefined;
    }
  }

  return undefined;
}
