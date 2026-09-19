import type { Layout, RegisteredGroup } from "../../components/group/types";
import {
  CURSOR_FLAG_HORIZONTAL_MAX,
  CURSOR_FLAG_HORIZONTAL_MIN,
  CURSOR_FLAG_VERTICAL_MAX,
  CURSOR_FLAG_VERTICAL_MIN,
  CURSOR_FLAGS_HORIZONTAL,
  CURSOR_FLAGS_VERTICAL
} from "../../constants";
import type { Point } from "../../types";
import { updateCursorStyle } from "../cursor/updateCursorStyle";
import type { HitRegion } from "../dom/calculateHitRegions";
import {
  updateMountedGroup,
  type MountedGroups
} from "../mutable-state/groups";
import { updateCursorFlags } from "../mutable-state/interactions";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { layoutsEqual } from "./layoutsEqual";

export function updateActiveHitRegions({
  document,
  event,
  hitRegions,
  initialLayoutMap,
  mountedGroups,
  pointerDownAtPoint,
  prevCursorFlags
}: {
  document: Document;
  event: {
    clientX: number;
    clientY: number;
    movementX: number;
    movementY: number;
  };
  hitRegions: HitRegion[];
  initialLayoutMap: Map<RegisteredGroup, Layout>;
  mountedGroups: MountedGroups;
  pointerDownAtPoint?: Point;
  prevCursorFlags: number;
}) {
  let nextCursorFlags = 0;

  // Note that HitRegions are frozen once a drag has started
  // Modify the Group layouts for all matching HitRegions though
  hitRegions.forEach((current) => {
    const { group, groupSize } = current;
    const { orientation, panels } = group;
    const { disableCursor } = group.mutableState;

    let deltaAsPercentage = 0;
    if (pointerDownAtPoint) {
      if (orientation === "horizontal") {
        deltaAsPercentage =
          ((event.clientX - pointerDownAtPoint.x) / groupSize) * 100;
      } else {
        deltaAsPercentage =
          ((event.clientY - pointerDownAtPoint.y) / groupSize) * 100;
      }
    } else {
      if (orientation === "horizontal") {
        deltaAsPercentage = event.clientX < 0 ? -100 : 100;
      } else {
        deltaAsPercentage = event.clientY < 0 ? -100 : 100;
      }
    }

    const initialLayout = initialLayoutMap.get(group);
    const groupState = mountedGroups.get(group);
    if (!initialLayout || !groupState) {
      return;
    }

    const {
      defaultLayoutDeferred,
      derivedPanelConstraints,
      groupSize: mountedGroupSize,
      layout: prevLayout,
      separatorToPanels
    } = groupState;
    if (derivedPanelConstraints && prevLayout && separatorToPanels) {
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
          switch (orientation) {
            case "horizontal": {
              nextCursorFlags |=
                deltaAsPercentage < 0
                  ? CURSOR_FLAG_HORIZONTAL_MIN
                  : CURSOR_FLAG_HORIZONTAL_MAX;
              break;
            }
            case "vertical": {
              nextCursorFlags |=
                deltaAsPercentage < 0
                  ? CURSOR_FLAG_VERTICAL_MIN
                  : CURSOR_FLAG_VERTICAL_MAX;
              break;
            }
          }
        }
      } else {
        updateMountedGroup(current.group, {
          defaultLayoutDeferred,
          derivedPanelConstraints: derivedPanelConstraints,
          groupSize: mountedGroupSize,
          layout: nextLayout,
          separatorToPanels
        });
      }
    }
  });

  // Edge case
  // Re-use previous horizontal/vertical cursor flags if there's been no movement since the last event
  // This accounts for edge cases in browsers like Firefox that sometimes round clientX/clientY values
  let cursorFlags = 0;
  if (event.movementX === 0) {
    cursorFlags |= prevCursorFlags & CURSOR_FLAGS_HORIZONTAL;
  } else {
    cursorFlags |= nextCursorFlags & CURSOR_FLAGS_HORIZONTAL;
  }
  if (event.movementY === 0) {
    cursorFlags |= prevCursorFlags & CURSOR_FLAGS_VERTICAL;
  } else {
    cursorFlags |= nextCursorFlags & CURSOR_FLAGS_VERTICAL;
  }

  updateCursorFlags(cursorFlags);
  updateCursorStyle(document);
}
