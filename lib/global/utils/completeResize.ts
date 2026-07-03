import { updateCursorStyle } from "../cursor/updateCursorStyle.ts";
import {
  getMountedGroupState,
  updateMountedGroup
} from "../mutable-state/groups.ts";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions.ts";

export function completeResize(event: MouseEvent, preventDefault: boolean) {
  const interactionState = getInteractionState();

  switch (interactionState.state) {
    case "active": {
      updateInteractionState({
        cursorFlags: 0,
        state: "inactive"
      });

      if (interactionState.hitRegions.length > 0) {
        updateCursorStyle(event.currentTarget as Document);

        // Dispatch one more "change" event after the interaction state has been reset.
        // Groups use this as a signal to call onLayoutChanged.
        // This is the canonical user-pointer-up site, so flag the dispatch with
        // isUserInteraction: true. See #716.
        interactionState.hitRegions.forEach((hitRegion) => {
          const groupState = getMountedGroupState(hitRegion.group.id, true);
          updateMountedGroup(hitRegion.group, groupState, {
            isUserInteraction: true
          });
        });

        if (preventDefault) {
          event.preventDefault();
        }
      }
    }
  }
}
