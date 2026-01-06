import type { Layout, RegisteredGroup } from "../../components/group/types";
import {
  CURSOR_FLAG_HORIZONTAL_MAX,
  CURSOR_FLAG_HORIZONTAL_MIN,
  CURSOR_FLAG_VERTICAL_MAX,
  CURSOR_FLAG_VERTICAL_MIN
} from "../../constants";
import type { Point } from "../../types";
import { updateCursorStyle } from "../cursor/updateCursorStyle";
import type { HitRegion } from "../dom/calculateHitRegions";
import { update, type MountedGroupMap } from "../mutableState";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import {
  getNextGroupLayoutState,
  scheduleLayoutSmoothing
} from "./layoutSmoothing";
import { layoutsEqual } from "./layoutsEqual";

export function updateActiveHitRegions({
  document,
  event,
  hitRegions,
  initialLayoutMap,
  mountedGroups,
  pointerDownAtPoint
}: {
  document: Document;
  event: {
    clientX: number;
    clientY: number;
  };
  hitRegions: HitRegion[];
  initialLayoutMap: Map<RegisteredGroup, Layout>;
  mountedGroups: MountedGroupMap;
  pointerDownAtPoint?: Point;
}) {
  let cursorFlags = 0;
  let shouldScheduleSmoothing = false;
  const nextMountedGroups = new Map(mountedGroups);

  // Note that HitRegions are frozen once a drag has started
  // Modify the Group layouts for all matching HitRegions though
  hitRegions.forEach((current) => {
    const { group, groupSize } = current;
    const { disableCursor, orientation, panels } = group;

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

    const match = mountedGroups.get(group);
    const {
      derivedPanelConstraints,
      layout: prevLayout,
      layoutTarget: prevLayoutTarget,
      separatorToPanels
    } = match ?? {};
    if (
      derivedPanelConstraints &&
      initialLayout &&
      prevLayout &&
      separatorToPanels
    ) {
      const nextLayout = adjustLayoutByDelta({
        delta: deltaAsPercentage,
        initialLayout,
        panelConstraints: derivedPanelConstraints,
        pivotIndices: current.panels.map((panel) => panels.indexOf(panel)),
        prevLayout,
        trigger: "mouse-or-touch"
      });

      const layoutTarget = prevLayoutTarget ?? prevLayout;

      if (layoutsEqual(nextLayout, layoutTarget)) {
        if (deltaAsPercentage !== 0 && !disableCursor) {
          // An unchanged means the cursor has exceeded the allowed bounds
          switch (orientation) {
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

        if (
          group.resizeSmoothing > 0 &&
          !layoutsEqual(prevLayout, layoutTarget)
        ) {
          shouldScheduleSmoothing = true;
        }
      } else {
        if (match) {
          const { next, didChange, shouldSchedule } = getNextGroupLayoutState({
            group,
            current: match,
            layoutTarget: nextLayout
          });

          if (didChange) {
            nextMountedGroups.set(current.group, next);
          }
          shouldScheduleSmoothing ||= shouldSchedule;
        }

        // Save the most recent layout for this group of panels in-memory
        // so that layouts will be remembered between different sets of conditionally rendered panels
        const panelIdsKey = current.group.panels.map(({ id }) => id).join(",");
        current.group.inMemoryLayouts[panelIdsKey] = nextLayout;
      }
    }
  });

  update({
    cursorFlags,
    mountedGroups: nextMountedGroups
  });

  updateCursorStyle(document);

  if (shouldScheduleSmoothing) {
    scheduleLayoutSmoothing();
  }
}
