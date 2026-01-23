import { read } from "../mutableState";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerLeave(event: PointerEvent) {
  const { cursorFlags, interactionState, mountedGroups } = read();

  switch (interactionState.state) {
    case "active": {
      updateActiveHitRegions({
        document: event.currentTarget as Document,
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedGroups,
        prevCursorFlags: cursorFlags
      });
    }
  }
}
