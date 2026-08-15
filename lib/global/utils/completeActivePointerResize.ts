import { updateCursorStyle } from "../cursor/updateCursorStyle.ts";
import {
  getMountedGroups,
  getMountedGroupState,
  updateMountedGroup
} from "../mutable-state/groups.ts";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions.ts";

export function completeActivePointerResize(document: Document) {
  const interactionState = getInteractionState();
  const mountedGroups = getMountedGroups();

  let match = false;

  switch (interactionState.state) {
    case "active": {
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
          if (!mountedGroups.has(hitRegion.group)) {
            return;
          }
          const groupState = getMountedGroupState(hitRegion.group.id, true);
          updateMountedGroup(hitRegion.group, groupState, {
            isUserInteraction: true
          });
        });
      }
    }
  }

  return match;
}
