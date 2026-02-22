import { updateCursorStyle } from "../cursor/updateCursorStyle";
import {
  getMountedGroups,
  getMountedGroupState,
  updateMountedGroup
} from "../mutable-state/groups";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerMove(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const interactionState = getInteractionState();
  const mountedGroups = getMountedGroups();

  switch (interactionState.state) {
    case "active": {
      // Edge case (see #340)
      // Detect when the pointer has been released outside an iframe on a different domain
      if (
        // Skip this check for "pointerleave" events, else Firefox triggers a false positive (see #514)
        event.buttons === 0
      ) {
        updateInteractionState({
          cursorFlags: 0,
          state: "inactive"
        });

        // Dispatch one more "change" event after the interaction state has been reset
        // Groups use this as a signal to call onLayoutChanged
        interactionState.hitRegions.forEach((hitRegion) => {
          const groupState = getMountedGroupState(hitRegion.group.id, true);
          updateMountedGroup(hitRegion.group, groupState);
        });

        return;
      }

      updateActiveHitRegions({
        document: event.currentTarget as Document,
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedGroups,
        pointerDownAtPoint: interactionState.pointerDownAtPoint,
        prevCursorFlags: interactionState.cursorFlags
      });
      break;
    }
    default: {
      // Update HitRegions if a drag has not been started
      const hitRegions = findMatchingHitRegions(event, mountedGroups);

      if (hitRegions.length === 0) {
        if (interactionState.state !== "inactive") {
          updateInteractionState({
            cursorFlags: 0,
            state: "inactive"
          });
        }
      } else {
        updateInteractionState({
          cursorFlags: 0,
          hitRegions,
          state: "hover"
        });
      }

      updateCursorStyle(event.currentTarget as Document);
      break;
    }
  }
}
