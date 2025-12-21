import { updateCursorStyle } from "../cursor/updateCursorStyle";
import { read, update } from "../mutableState";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerMove(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const { interactionState, mountedGroups } = read();

  switch (interactionState.state) {
    case "active": {
      // Edge case (see #340)
      // Detect when the pointer has been released outside an iframe on a different domain
      if (
        // Skip this check for "pointerleave" events, else Firefox triggers a false positive (see #514)
        event.buttons === 0
      ) {
        update((prevState) =>
          prevState.interactionState.state === "inactive"
            ? prevState
            : {
                cursorFlags: 0,
                interactionState: {
                  state: "inactive"
                }
              }
        );

        return;
      }

      updateActiveHitRegions({
        document: event.currentTarget as Document,
        event,
        hitRegions: interactionState.hitRegions,
        initialLayoutMap: interactionState.initialLayoutMap,
        mountedGroups,
        pointerDownAtPoint: interactionState.pointerDownAtPoint
      });
      break;
    }
    default: {
      // Update HitRegions if a drag has not been started
      const hitRegions = findMatchingHitRegions(event, mountedGroups);

      if (hitRegions.length === 0) {
        if (interactionState.state !== "inactive") {
          update({
            interactionState: { state: "inactive" }
          });
        }
      } else {
        update({
          interactionState: {
            hitRegions,
            state: "hover"
          }
        });
      }

      updateCursorStyle(event.currentTarget as Document);
      break;
    }
  }
}
