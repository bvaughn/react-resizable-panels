import { calculateAvailableAxisSize } from "../dom/calculateAvailableAxisSize";
import { calculateItemConstraints } from "../dom/calculateItemConstraints";
import type { MountedAxisState } from "../mutable-state/axes";
import type { RegisteredResizeAxis } from "../types";
import { getDefaultLayout } from "./getDefaultLayout";
import { itemConstraintsEqual } from "./itemConstraintsEqual";
import { layoutsEqual } from "./layoutsEqual";
import { normalizeLayout } from "./normalizeLayout";
import { preserveFixedItemSizes } from "./preserveFixedItemSizes";
import { validateAxisLayout } from "./validateAxisLayout";

/**
 * Re-derive an axis' size, pixel based constraints, and layout from its current DOM size.
 * Returns undefined if the axis has no size (e.g. it's within a hidden subtree).
 *
 * The axis' ResizeObserver does this when the axis is resized,
 * but imperative API calls may run before it does (e.g. from an application's own ResizeObserver; see #770)
 * so they also do this before validating against the current state.
 *
 * This function does not update the mounted axis state.
 */
export function syncAxisStateToCurrentSize({
  axis,
  axisState
}: {
  axis: RegisteredResizeAxis;
  axisState: MountedAxisState;
}): { changed: boolean; state: MountedAxisState } | undefined {
  const axisSize = calculateAvailableAxisSize({ axis });
  if (axisSize === 0) {
    // Can't calculate anything meaningful if the group has a width/height of 0
    // (This could indicate that it's within a hidden subtree)
    return undefined;
  }

  // Update non-percentage based constraints
  const derivedItemConstraints = calculateItemConstraints(axis, axisSize);

  // Revalidate layout in case constraints have changed or group size changed
  // Start from the requested layout so that constraints only temporarily clamp item sizes (see #720)
  let requestedAxisSize = axisState.requestedAxisSize;
  let requestedLayout = axisState.requestedLayout;
  if (axisState.defaultLayoutDeferred) {
    requestedAxisSize = axisSize;
    requestedLayout = normalizeLayout({
      itemIds: axis.items.map(({ id }) => id),
      layout: getDefaultLayout({
        axis,
        itemConstraints: derivedItemConstraints
      })
    });
  }

  const unsafeLayout = preserveFixedItemSizes({
    axis,
    nextAxisSize: axisSize,
    prevAxisSize: requestedAxisSize,
    prevLayout: requestedLayout
  });
  const layout = validateAxisLayout({
    layout: unsafeLayout,
    itemConstraints: derivedItemConstraints
  });

  const changed =
    axisState.defaultLayoutDeferred ||
    !layoutsEqual(axisState.layout, layout) ||
    !itemConstraintsEqual(
      axisState.derivedItemConstraints,
      derivedItemConstraints
    ) ||
    axisState.axisSize !== axisSize;

  return {
    changed,
    state: {
      defaultLayoutDeferred: false,
      derivedItemConstraints,
      axisSize,
      layout,
      requestedAxisSize,
      requestedLayout,
      separatorToItems: axisState.separatorToItems
    }
  };
}
