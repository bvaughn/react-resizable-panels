import { calculateDefaultLayout } from "./calculateDefaultLayout";
import { getItemResizeBehaviors } from "./getItemResizeBehaviors";
import { preserveFixedItemSizes } from "./preserveFixedItemSizes";
import { validateLayoutKeys } from "./validateLayoutKeys";
import type {
  Layout,
  RegisteredResizeAxis,
  ResizeItemConstraints
} from "../types";

/**
 * Returns the initial layout for an axis' current item configuration:
 * the cached layout for these items (if any), else the default layout (if still valid), else a calculated one.
 *
 * The returned axisSize is the size the layout's percentages were measured at.
 * It can differ from the current axis size when a cached layout is restored,
 * so callers must run the layout through preserveFixedItemSizes (from axisSize to the current size) before validating it.
 */
export function getDefaultLayout({
  axis,
  axisSize,
  itemConstraints
}: {
  axis: RegisteredResizeAxis;
  axisSize: number;
  itemConstraints: ResizeItemConstraints[];
}): { axisSize: number; layout: Layout } {
  const itemIdsKey = axis.items.map(({ id }) => id).join(",");
  const cached = axis.mutableState.layouts[itemIdsKey];
  if (cached) {
    const currentResizeBehaviors = getItemResizeBehaviors(axis);
    const resizeBehaviorsMatch = cached.resizeBehaviors.every(
      (behavior, index) => behavior === currentResizeBehaviors[index]
    );
    if (resizeBehaviorsMatch) {
      // The caller converts the cached layout from its original axis size
      return { axisSize: cached.axisSize, layout: cached.layout };
    }

    // The cached layout's pixel-size basis only applies to the behaviors it was recorded with,
    // so convert it to the current size using those behaviors and make the current size its new basis.
    // Otherwise changing an item's behavior would resize it (e.g. a 100px item would grow to 200px after the group doubled in size).
    return {
      axisSize,
      layout: preserveFixedItemSizes({
        axis,
        nextAxisSize: axisSize,
        prevAxisSize: cached.axisSize,
        prevLayout: cached.layout,
        resizeBehaviors: cached.resizeBehaviors
      })
    };
  }

  const defaultLayout = axis.mutableState.defaultLayout;

  // Dynamic panel configurations can invalidate a supplied default layout.
  return {
    axisSize,
    layout:
      defaultLayout && validateLayoutKeys(axis.items, defaultLayout)
        ? defaultLayout
        : calculateDefaultLayout(itemConstraints)
  };
}
