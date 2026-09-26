import { updateCursorStyle } from "../cursor/updateCursorStyle.ts";
import { updateActiveHitRegions } from "./updateActiveHitRegion";
import {
  getMountedAxes,
  getMountedAxisState,
  updateMountedAxis
} from "../mutable-state/axes.ts";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions.ts";

export function completeActivePointerResize(
  document: Document,
  event: {
    clientX: number;
    clientY: number;
    movementX: number;
    movementY: number;
  }
) {
  const interactionState = getInteractionState();
  const mountedAxes = getMountedAxes();

  let match = false;

  switch (interactionState.state) {
    case "active": {
      updateActiveHitRegions({
        commit: true,
        document,
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedAxes,
        pointerDownAtPoint: interactionState.pointerDownAtPoint,
        prevCursorFlags: interactionState.cursorFlags
      });

      updateInteractionState({
        cursorFlags: 0,
        state: "inactive"
      });

      if (interactionState.hitRegions.length > 0) {
        updateCursorStyle(document);

        match = true;

        // Dispatch one more "change" event after the interaction state has been reset.
        // Groups use this as a signal to call onLayoutChanged.
        // This is the canonical user-pointer-up site, so flag the dispatch with
        // isUserInteraction: true. See #716.
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
    }
  }

  return match;
}
