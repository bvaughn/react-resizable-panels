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
import {
  getInteractionState,
  updateCursorFlags
} from "../mutable-state/interactions";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { layoutsEqual } from "./layoutsEqual";

export function updateActiveHitRegions({
  commit,
  document,
  event,
  hitRegions,
  initialLayoutMap,
  mountedGroups,
  pointerDownAtPoint,
  prevCursorFlags
}: {
  commit: boolean;
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
  const interaction = getInteractionState();
  let previews = interaction.state === "active" ? interaction.previews : [];
  const previewLayoutMap = new Map(
    interaction.state === "active" ? interaction.previewLayoutMap : undefined
  );

  // Note that HitRegions are frozen once a drag has started
  // Modify the Group layouts for all matching HitRegions though
  hitRegions.forEach((current) => {
    const { group, groupSize } = current;
    const { orientation, panels } = group;
    if (commit && group.resizePreviewMode !== "separator") {
      return;
    }
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
      layout: mountedLayout,
      separatorToPanels
    } = groupState;
    if (derivedPanelConstraints && mountedLayout && separatorToPanels) {
      const prevLayout =
        group.resizePreviewMode === "separator"
          ? (previewLayoutMap.get(group) ?? mountedLayout)
          : mountedLayout;
      const nextLayout = adjustLayoutByDelta({
        delta: deltaAsPercentage,
        initialLayout,
        panelConstraints: derivedPanelConstraints,
        pivotIndices: current.panels.map((panel) => panels.indexOf(panel)),
        prevLayout,
        trigger: "mouse-or-touch"
      });

      // Preview every moved boundary, deferring the layout update until release.
      if (
        group.resizePreviewMode === "separator" &&
        !commit &&
        !layoutsEqual(nextLayout, prevLayout)
      ) {
        previewLayoutMap.set(group, nextLayout);

        let total = 0;
        const offsets = panels.map((panel) => {
          total += nextLayout[panel.id] - initialLayout[panel.id];
          return total * (groupSize / 100);
        });

        previews = previews.map((preview) => {
          if (preview.group !== group) {
            return preview;
          }

          const offset = offsets[preview.panelIndex];
          return offset === preview.offset ? preview : { ...preview, offset };
        });
      }

      if (layoutsEqual(nextLayout, prevLayout)) {
        if (deltaAsPercentage !== 0 && !disableCursor) {
          // An unchanged layout means the cursor has exceeded the allowed bounds
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
      }

      if (
        (group.resizePreviewMode !== "separator" || commit) &&
        !layoutsEqual(nextLayout, mountedLayout)
      ) {
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

  const didPointerMove =
    interaction.state === "active" &&
    (event.clientX !== interaction.pointerDownAtPoint.x ||
      event.clientY !== interaction.pointerDownAtPoint.y);

  updateCursorFlags(cursorFlags, previews, previewLayoutMap, didPointerMove);
  updateCursorStyle(document);
}
