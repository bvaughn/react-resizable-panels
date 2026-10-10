import { updateCursorStyle } from "../cursor/updateCursorStyle";
import {
  getMountedAxes,
  getMountedAxisState,
  updateMountedAxis
} from "../mutable-state/axes";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import { isActivePointerEvent } from "./isActivePointerEvent";
import { layoutsEqual } from "./layoutsEqual";

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
  pointerId?: number
) {
  const interactionState = getInteractionState();
  if (
    interactionState.state !== "active" ||
    !isActivePointerEvent(interactionState, document, pointerId)
  ) {
    return false;
  }

  const mountedAxes = getMountedAxes();

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

  updateInteractionState({
    cursorFlags: 0,
    state: "inactive"
  });

  // Dispatch one more "change" event after the interaction state has been reset.
  // Groups use this as a signal to call onLayoutChanged.
  // The gesture was started by the user, so this is still a user interaction.
  interactionState.hitRegions.forEach((hitRegion) => {
    // Skip if the group was re-registered mid-gesture, so the old hit region
    // doesn't resurrect a stale entry in the mounted-groups map. See #729.
    if (!mountedAxes.has(hitRegion.axis)) {
      return;
    }
    const axisState = getMountedAxisState(hitRegion.axis.id, true);
    updateMountedAxis(hitRegion.axis, axisState, {
      isUserInteraction: true
    });
  });

  updateCursorStyle(document);

  return true;
}
