import { updateCursorStyle } from "../cursor/updateCursorStyle";
import {
  getMountedAxes,
  getMountedAxisState,
  updateMountedAxis
} from "../mutable-state/axes";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import { layoutsEqual } from "../utils/layoutsEqual";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";
import { updateActiveHitRegions } from "../utils/updateActiveHitRegion";

export function onDocumentPointerMove(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const interactionState = getInteractionState();
  const mountedAxes = getMountedAxes();

  switch (interactionState.state) {
    case "active": {
      // Edge case (see #340)
      // Detect when the pointer has been released outside an iframe on a different domain
      if (
        // Skip this check for "pointerleave" events, else Firefox triggers a false positive (see #514)
        event.buttons === 0
      ) {
        // This event is a later hover, not the release position.
        // Commit the last preview without incorporating movement after the button was released.
        interactionState.previewLayoutMap.forEach((layout, axis) => {
          const axisState = mountedAxes.get(axis);
          if (
            axis.resizePreviewMode === "separator" &&
            axisState &&
            !layoutsEqual(layout, axisState.layout)
          ) {
            updateMountedAxis(axis, {
              ...axisState,
              layout,
              requestedAxisSize: axisState.axisSize,
              requestedLayout: layout
            });
          }
        });

        updateInteractionState({
          cursorFlags: 0,
          state: "inactive"
        });

        // Dispatch one more "change" event after the interaction state has been reset.
        // Groups use this as a signal to call onLayoutChanged.
        // This is the missed-pointerup fallback (pointer released outside a
        // cross-origin iframe, see #340) — still a real user interaction.
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

        updateCursorStyle(event.currentTarget as Document);

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
        document: event.currentTarget as Document,
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
      const hitRegions = findMatchingHitRegions(event, mountedAxes);

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
          state: "hover"
        });
      }

      updateCursorStyle(event.currentTarget as Document);
      break;
    }
  }
}
