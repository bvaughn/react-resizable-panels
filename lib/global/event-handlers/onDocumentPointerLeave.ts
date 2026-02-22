import { getMountedGroups } from "../mutable-state/groups";
import { getInteractionState } from "../mutable-state/interactions";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerLeave(event: PointerEvent) {
  const mountedGroups = getMountedGroups();
  const interactionState = getInteractionState();

  switch (interactionState.state) {
    case "active": {
      updateActiveHitRegions({
        document: event.currentTarget as Document,
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedGroups,
        prevCursorFlags: interactionState.cursorFlags
      });
    }
  }
}
