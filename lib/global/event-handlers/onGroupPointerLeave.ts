import { read } from "../mutableState";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onGroupPointerLeave(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.relatedTarget !== null) {
    return;
  }

  const { interactionState, mountedGroups } = read();

  // The "pointerleave" event is not reliably triggered when the pointer exits a window or iframe
  // To account for this, we listen for "pointerleave" events on the Group element itself
  switch (interactionState.state) {
    case "active": {
      interactionState.hitRegions.forEach((hitRegion) => {
        if (event.currentTarget === hitRegion.group.element) {
          updateActiveHitRegions({
            event,
            hitRegions: interactionState.hitRegions,
            initialLayoutMap: interactionState.initialLayoutMap,
            mountedGroups
          });
        }
      });
    }
  }
}
