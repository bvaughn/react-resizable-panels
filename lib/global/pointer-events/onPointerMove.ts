import { saveGroupLayout } from "../../components/group/auto-save/saveGroupLayout";
import { getDefaultStorage } from "../../components/group/getDefaultStorage";
import {
  CURSOR_FLAG_HORIZONTAL_MAX,
  CURSOR_FLAG_HORIZONTAL_MIN,
  CURSOR_FLAG_VERTICAL_MAX,
  CURSOR_FLAG_VERTICAL_MIN
} from "../../constants";
import { updateCursorStyle } from "../cursor/updateCursorStyle";
import { read, update } from "../mutableState";
import { adjustLayoutByDelta } from "../utils/adjustLayoutByDelta";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";
import { layoutsEqual } from "../utils/layoutsEqual";

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
                cursorFlags: 0,
                interactionState: {
                  state: "inactive"
                }
              }
        );

        return;
      }

      let cursorFlags = 0;
      const nextMountedGroups = new Map(mountedGroups);

      // Note that HitRegions are frozen once a drag has started
      // Modify the Group layouts for all matching HitRegions though
      interactionState.hitRegions.forEach((current) => {
        const {
          autoSave,
          direction,
          disableCursor,
          element,
          id,
          panels,
          storage = getDefaultStorage()
        } = current.group;

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
            prevLayout,
            trigger: "mouse-or-touch"
          });

          if (layoutsEqual(nextLayout, prevLayout)) {
            if (deltaAsPercentage !== 0 && !disableCursor) {
              // An unchanged means the cursor has exceeded the allowed bounds
              switch (direction) {
                case "horizontal": {
                  cursorFlags |=
                    deltaAsPercentage < 0
                      ? CURSOR_FLAG_HORIZONTAL_MIN
                      : CURSOR_FLAG_HORIZONTAL_MAX;
                  break;
                }
                case "vertical": {
                  cursorFlags |=
                    deltaAsPercentage < 0
                      ? CURSOR_FLAG_VERTICAL_MIN
                      : CURSOR_FLAG_VERTICAL_MAX;
                  break;
                }
              }
            }
          } else {
            nextMountedGroups.set(current.group, {
              derivedPanelConstraints: derivedPanelConstraints,
              layout: nextLayout
            });

            if (autoSave) {
              saveGroupLayout({
                id,
                layout: nextLayout,
                panels,
                storage
              });
            }
          }
        }
      });

      update({
        cursorFlags,
        mountedGroups: nextMountedGroups
      });

      updateCursorStyle();
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

      updateCursorStyle();
      break;
    }
  }
}
