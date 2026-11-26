import {
  endAxisChangeBatch,
  getMountedAxes,
  startAxisChangeBatch,
  updateMountedAxis
} from "../mutable-state/axes";
import { getInteractionState } from "../mutable-state/interactions";
import { finishActivePointerResize } from "./finishActivePointerResize";
import { isActivePointerEvent } from "./isActivePointerEvent";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { layoutsEqual } from "./layoutsEqual";
import { snapSeparatorDelta } from "./snapSeparatorDelta";

/**
 * Ends an active pointer resize when the pointer-up event was missed or the browser cancelled the gesture
 * (e.g. "pointercancel", "lostpointercapture", window "blur", or a release outside of a cross-origin iframe).
 *
 * Unlike completeActivePointerResize, this does not incorporate the triggering event's position;
 * those events either have no coordinates or report a position unrelated to the drag.
 * The last previewed (or live) layout is committed instead.
 */
export function abortActivePointerResize(
  document: Document,
  pointer?: { pointerId: number; pointerType: string }
) {
  const interactionState = getInteractionState();
  if (
    interactionState.state !== "active" ||
    !isActivePointerEvent(interactionState, document, pointer)
  ) {
    return false;
  }

  const mountedAxes = getMountedAxes();

  // Layout change callbacks may throw;
  // defer them so the interaction state is always reset and every group is still notified
  startAxisChangeBatch();
  try {
    interactionState.previewLayoutMap.forEach((layout, axis) => {
      const axisState = mountedAxes.get(axis);
      if (
        axis.resizePreviewMode === "separator" &&
        axisState &&
        !layoutsEqual(layout, axisState.layout)
      ) {
        updateMountedAxis(axis, {
          ...axisState,
          layout,
          requestedAxisSize: axisState.axisSize,
          requestedLayout: layout
        });
      }
    });

    // Layouts that snap on release are unsnapped while dragging, so they still need to snap
    interactionState.hitRegions.forEach(({ axis, items }) => {
      const initialLayout = interactionState.initialLayoutMap.get(axis);
      const axisState = mountedAxes.get(axis);
      if (
        axis.snapBehavior !== "on-release" ||
        axis.resizePreviewMode === "separator" ||
        !initialLayout ||
        !axisState?.derivedItemConstraints ||
        !axisState.layout ||
        !axisState.derivedItemConstraints.some(
          (constraints) => constraints.snapSizes?.length
        )
      ) {
        return;
      }

      const { derivedItemConstraints, layout } = axisState;
      const pivotIndices = items.map((item) => axis.items.indexOf(item));
      const [first, second] = items;
      const firstChange = layout[first.id] - initialLayout[first.id];
      const secondChange = layout[second.id] - initialLayout[second.id];
      const delta = snapSeparatorDelta({
        delta: firstChange !== 0 ? firstChange : -secondChange,
        initialLayout,
        itemConstraints: derivedItemConstraints,
        pivotIndices,
        released: true,
        snapBehavior: axis.snapBehavior
      });
      const nextLayout = adjustLayoutByDelta({
        delta,
        initialLayout,
        itemConstraints: derivedItemConstraints,
        pivotIndices,
        prevLayout: layout,
        trigger: "mouse-or-touch"
      });
      if (!layoutsEqual(nextLayout, layout)) {
        updateMountedAxis(axis, {
          ...axisState,
          layout: nextLayout,
          requestedAxisSize: axisState.axisSize,
          requestedLayout: nextLayout
        });
      }
    });

    finishActivePointerResize(interactionState, mountedAxes);
  } finally {
    endAxisChangeBatch();
  }

  return true;
}
