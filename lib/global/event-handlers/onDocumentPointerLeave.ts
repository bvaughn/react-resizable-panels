import { read } from "../mutableState";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerLeave(event: PointerEvent) {
  const { interactionState, mountedGroups } = read();

  switch (interactionState.state) {
    case "active": {
      updateActiveHitRegions({
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedGroups
      });
    }
  }
}
