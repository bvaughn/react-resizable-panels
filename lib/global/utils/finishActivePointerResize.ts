import {
  flushAxisChangeBatch,
  getMountedAxisState,
  updateMountedAxis,
  type MountedAxes
} from "../mutable-state/axes";
import { updateInteractionState } from "../mutable-state/interactions";
import type { InteractionActive } from "../mutable-state/types";

/**
 * Resets an active pointer resize (completed or aborted) to the inactive state
 * and notifies the axes it affected.
 *
 * Must be called within an axis change batch (see startAxisChangeBatch).
 */
export function finishActivePointerResize(
  interactionState: InteractionActive,
  mountedAxes: MountedAxes
) {
  // Groups only call onLayoutChanged once the interaction has ended,
  // so changes made during the interaction must be observed before it is reset
  flushAxisChangeBatch();

  updateInteractionState({
    cursorFlags: 0,
    state: "inactive"
  });

  // Dispatch one more "change" event after the interaction state has been reset.
  // Groups use this as a signal to call onLayoutChanged.
  // The gesture was started by the user, so this is a user interaction. See #716.
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
}
