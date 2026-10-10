import { getMountedAxes } from "../mutable-state/axes";
import { getInteractionState } from "../mutable-state/interactions";
import { isActivePointerEvent } from "../utils/isActivePointerEvent";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerLeave(event: PointerEvent) {
  const ownerDocument = event.currentTarget as Document;
  const mountedAxes = getMountedAxes();
  const interactionState = getInteractionState();

  switch (interactionState.state) {
    case "active": {
      // Ignore other pointers, and pointers leaving other documents (e.g. a popup window)
      if (
        !isActivePointerEvent(interactionState, ownerDocument, event.pointerId)
      ) {
        return;
      }

      updateActiveHitRegions({
        commit: false,
        document: ownerDocument,
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedAxes,
        prevCursorFlags: interactionState.cursorFlags
      });
    }
  }
}
