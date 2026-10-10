import {
  endAxisChangeBatch,
  flushAxisChangeBatch,
  getMountedAxes,
  getMountedAxisState,
  startAxisChangeBatch,
  updateMountedAxis
} from "../mutable-state/axes.ts";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions.ts";
import { isActivePointerEvent } from "./isActivePointerEvent";
import { updateActiveHitRegions } from "./updateActiveHitRegion";

/**
 * Commits an active pointer resize at the position of the triggering event.
 * The event is prevented if it completes a drag.
 */
export function completeActivePointerResize(
  document: Document,
  event: {
    clientX: number;
    clientY: number;
    movementX: number;
    movementY: number;
    pointerId?: number;
    pointerType?: string;
    preventDefault?: () => void;
  }
) {
  const interactionState = getInteractionState();
  if (
    interactionState.state !== "active" ||
    !isActivePointerEvent(interactionState, document, event)
  ) {
    return;
  }

  const mountedAxes = getMountedAxes();

  // Layout change callbacks may throw;
  // defer them so the interaction state is always reset and every group is still notified
  startAxisChangeBatch();
  try {
    updateActiveHitRegions({
      commit: true,
      event,
      hitRegions: interactionState.hitRegions,
      initialLayoutMap: interactionState.initialLayoutMap,
      mountedAxes,
      pointerDownAtPoint: interactionState.pointerDownAtPoint,
      prevCursorFlags: interactionState.cursorFlags
    });

    // Groups only call onLayoutChanged once the interaction has ended,
    // so changes made during the interaction must be observed before it is reset
    flushAxisChangeBatch();

    updateInteractionState({
      cursorFlags: 0,
      state: "inactive"
    });

    if (interactionState.hitRegions.length > 0) {
      event.preventDefault?.();

      // Dispatch one more "change" event after the interaction state has been reset.
      // Groups use this as a signal to call onLayoutChanged.
      // This is the canonical user-pointer-up site, so flag the dispatch with
      // isUserInteraction: true. See #716.
      interactionState.hitRegions.forEach((hitRegion) => {
        // Skip if the group was re-registered mid-gesture, so the old hit region
        // doesn't resurrect a stale entry in the mounted-groups map. See #729.
        if (!mountedAxes.has(hitRegion.axis)) {
          return;
        }
        const axisState = getMountedAxisState(hitRegion.axis.id, true);
        updateMountedAxis(hitRegion.axis, axisState, {
          isUserInteraction: true
        });
      });
    }
  } finally {
    endAxisChangeBatch();
  }
}
