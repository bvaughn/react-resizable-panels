import { getMountedAxes } from "../mutable-state/axes";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import { abortActivePointerResize } from "../utils/abortActivePointerResize";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";
import { isActivePointerEvent } from "../utils/isActivePointerEvent";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerMove(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const ownerDocument = event.currentTarget as Document;
  const interactionState = getInteractionState();
  const mountedAxes = getMountedAxes();

  switch (interactionState.state) {
    case "active": {
      // Ignore other pointers, and pointers in other documents (e.g. a popup window);
      // their coordinates and buttons are unrelated to the active drag
      if (!isActivePointerEvent(interactionState, ownerDocument, event)) {
        return;
      }

      // Edge case (see #340)
      // Detect when the pointer has been released outside an iframe on a different domain
      if (
        // Skip this check for "pointerleave" events, else Firefox triggers a false positive (see #514)
        event.buttons === 0
      ) {
        // This event is a later hover, not the release position.
        // Commit the last preview without incorporating movement after the button was released.
        abortActivePointerResize(ownerDocument, event);

        return;
      }

      for (const hitRegion of interactionState.hitRegions) {
        if (hitRegion.separator) {
          const { element } = hitRegion.separator;
          if (
            element.isConnected &&
            !element.hasPointerCapture?.(event.pointerId)
          ) {
            element.setPointerCapture?.(event.pointerId);
          }
        }
      }

      updateActiveHitRegions({
        commit: false,
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedAxes,
        pointerDownAtPoint: interactionState.pointerDownAtPoint,
        prevCursorFlags: interactionState.cursorFlags
      });
      break;
    }
    default: {
      // Update HitRegions if a drag has not been started
      const hitRegions = findMatchingHitRegions(
        event,
        mountedAxes,
        ownerDocument
      );

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
          ownerDocument,
          state: "hover"
        });
      }

      break;
    }
  }
}
