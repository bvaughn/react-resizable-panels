import { getItemResizeBehaviors } from "./getItemResizeBehaviors";
import { layoutNumbersEqual } from "./layoutNumbersEqual";
import type {
  Layout,
  RegisteredResizeAxis,
  ResizeItemConstraints
} from "../types";

/**
 * Updates the in-memory bookkeeping a Group needs to restore previous layouts:
 * - Cache the requested layout and its axis size (keyed by panel ids) so they persist when the panel configuration changes.
 *   This improves UX for conditionally rendered panels without requiring defaultLayout.
 * - Record the pre-collapse size of any collapsible panel that was just collapsed,
 *   (and the axis size it was measured at) so that it can be restored when the panel is expanded (e.g. via the keyboard)
 */
export function recordAxisLayoutChange({
  derivedItemConstraints,
  axis,
  layout,
  prevAxisSize,
  prevLayout,
  requestedAxisSize,
  requestedLayout
}: {
  derivedItemConstraints: ResizeItemConstraints[];
  axis: RegisteredResizeAxis;
  layout: Layout;
  prevAxisSize: number | undefined;
  prevLayout: Layout | undefined;
  requestedAxisSize: number;
  requestedLayout: Layout;
}) {
  const itemIdsKey = axis.items.map(({ id }) => id).join(",");
  axis.mutableState.layouts[itemIdsKey] = {
    axisSize: requestedAxisSize,
    layout: requestedLayout,
    resizeBehaviors: getItemResizeBehaviors(axis)
  };

  if (prevLayout && prevAxisSize !== undefined) {
    derivedItemConstraints.forEach((constraints) => {
      if (constraints.collapsible) {
        const isCollapsed = layoutNumbersEqual(
          constraints.collapsedSize,
          layout[constraints.itemId]
        );
        const wasCollapsed = layoutNumbersEqual(
          constraints.collapsedSize,
          prevLayout[constraints.itemId]
        );
        if (isCollapsed && !wasCollapsed) {
          axis.mutableState.expandedItemSizes[constraints.itemId] = {
            axisSize: prevAxisSize,
            size: prevLayout[constraints.itemId]
          };
        }
      }
    });
  }
}
