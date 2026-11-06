import {
  endAxisChangeBatch,
  getMountedAxes,
  startAxisChangeBatch
} from "../mutable-state/axes";
import { getInteractionState } from "../mutable-state/interactions";
import { finishActivePointerResize } from "./finishActivePointerResize";
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

    if (interactionState.hitRegions.length > 0) {
      event.preventDefault?.();
    }

    finishActivePointerResize(interactionState, mountedAxes);
  } finally {
    endAxisChangeBatch();
  }
}
