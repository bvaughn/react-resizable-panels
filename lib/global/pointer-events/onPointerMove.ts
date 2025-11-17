import { read, update } from "../mutableState";
import { adjustLayoutByDelta } from "../utils/adjustLayoutByDelta";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";

export function onPointerMove(event: PointerEvent) {
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
        event.type !== "pointerleave" &&
        event.buttons === 0
      ) {
        update((prevState) =>
          prevState.interactionState.state === "inactive"
            ? prevState
            : {
                interactionState: {
                  state: "inactive"
                }
              }
        );

        return;
      }

      // Note that HitRegions are frozen once a drag has started
      // Modify the Group layouts for all matching HitRegions though
      interactionState.hitRegions.forEach((current) => {
        const { direction, element, panels } = current.group;

        let deltaAsPercentage = 0;
        if (interactionState.state === "active") {
          if (direction === "horizontal") {
            deltaAsPercentage =
              ((event.clientX - interactionState.pointerDownAtPoint.x) /
                element.offsetWidth) *
              100;
          } else {
            deltaAsPercentage =
              ((event.clientY - interactionState.pointerDownAtPoint.y) /
                element.offsetHeight) *
              100;
          }
        }

        const initialLayout = interactionState.initialLayoutMap.get(
          current.group
        );
        const { derivedPanelConstraints, layout: prevLayout } =
          mountedGroups.get(current.group) ?? {};
        if (derivedPanelConstraints && initialLayout && prevLayout) {
          const nextLayout = adjustLayoutByDelta({
            delta: deltaAsPercentage,
            initialLayout,
            panelConstraints: derivedPanelConstraints,
            pivotIndices: current.panels.map((panel) => panels.indexOf(panel)),
            prevLayout: prevLayout,
            trigger: "mouse-or-touch"
          });

          const nextMountedGroups = new Map(mountedGroups);
          nextMountedGroups.set(current.group, {
            derivedPanelConstraints: derivedPanelConstraints,
            layout: nextLayout
          });

          // Update layout in mutable state
          update({
            mountedGroups: nextMountedGroups
          });
        }
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
      break;
    }
  }

  // TODO Update global cursor
}
