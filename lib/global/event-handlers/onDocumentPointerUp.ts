import { updateCursorStyle } from "../cursor/updateCursorStyle";
import {
  getMountedGroupState,
  updateMountedGroup
} from "../mutable-state/groups";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";

export function onDocumentPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  const interactionState = getInteractionState();

  switch (interactionState.state) {
    case "active": {
      updateInteractionState({
        cursorFlags: 0,
        state: "inactive"
      });

      if (interactionState.hitRegions.length > 0) {
        updateCursorStyle(event.currentTarget as Document);

        // Dispatch one more "change" event after the interaction state has been reset
        // Groups use this as a signal to call onLayoutChanged
        interactionState.hitRegions.forEach((hitRegion) => {
          const groupState = getMountedGroupState(hitRegion.group.id, true);
          updateMountedGroup(hitRegion.group, groupState);
        });

        event.preventDefault();
      }
    }
  }
}
