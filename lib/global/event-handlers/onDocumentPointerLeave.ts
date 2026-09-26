import { getMountedAxes } from "../mutable-state/axes";
import { getInteractionState } from "../mutable-state/interactions";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerLeave(event: PointerEvent) {
  const mountedAxes = getMountedAxes();
  const interactionState = getInteractionState();

  switch (interactionState.state) {
    case "active": {
      updateActiveHitRegions({
        commit: false,
        document: event.currentTarget as Document,
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedAxes,
        prevCursorFlags: interactionState.cursorFlags
      });
    }
  }
}
