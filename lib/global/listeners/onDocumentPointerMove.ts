import { CursorFlags } from "../../constants";
import {
  cursorFlags as cursorFlagsRef,
  groups,
  pendingTransactions,
  pointerDownAtPoint
} from "../../state/Root";
import { adjustLayoutByDelta } from "../../utils/adjustLayoutByDelta";
import { findMatchingHitRegions } from "../../utils/findMatchingHitRegions";
import { layoutsEqual } from "../../utils/layoutsEqual";
import { scalePanelDimensions } from "../../utils/scalePanelDimensions";
import { getCursorStyle } from "../cursor/getCursorStyle";
import { updateCursorStyle } from "../cursor/updateCursorStyle";
import type { HitRegion } from "../dom/calculateHitRegions";

export function onDocumentPointerMove(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const prevCursorFlags = cursorFlagsRef.current;

  let nextCursorFlags = 0;
  let hitRegions: HitRegion[] = [];

  const point = pointerDownAtPoint.current;
  if (point && pendingTransactions.length) {
    // Edge case: Pointer has been released outside an iframe on a different domain
    // See github.com/bvaughn/react-resizable-panels/issues/340
    if (event.buttons === 0) {
      pendingTransactions.slice().forEach((transaction) => {
        if (transaction.hitRegion && transaction.hitRegion.separator) {
          transaction.hitRegion.group.updateSeparatorState(
            transaction.hitRegion.separator,
            "default"
          );
        }

        transaction.endTransaction();
      });

      cursorFlagsRef.current = 0;

      updateCursorStyle({
        cursorStyle: undefined,
        ownerDocument: event.currentTarget as Document,
        state: "inactive"
      });

      return;
    }

    pendingTransactions.forEach((transaction) => {
      const { group, initialLayout, pendingLayout, hitRegion } = transaction;

      if (!hitRegion) {
        // This transaction was not initiated by a PointerEvent
        return;
      }

      hitRegions.push(hitRegion);

      const deltaInPixels =
        group.orientation === "horizontal"
          ? event.clientX - point.x
          : event.clientY - point.y;
      const deltaAsPercentage = (deltaInPixels / group.groupSize) * 100;

      const scaledConstraints = scalePanelDimensions({
        groupSize: transaction.group.groupSize,
        panels: transaction.group.panels
      });

      const pivotIndices = hitRegion.panels.map((panel) =>
        hitRegion.group.panels.indexOf(panel)
      );

      const unsafeLayout = adjustLayoutByDelta({
        delta: deltaAsPercentage,
        initialLayout: initialLayout,
        panelConstraints: scaledConstraints,
        pivotIndices,
        prevLayout: pendingLayout,
        trigger: "mouse-or-touch"
      });

      if (layoutsEqual(hitRegion.group.layout, unsafeLayout)) {
        // Detect when the cursor has exceeded the allowed bounds for a group
        // This is signaled by an unchanged layout
        if (!hitRegion.group.disableCursor) {
          switch (hitRegion.group.orientation) {
            case "horizontal": {
              if (deltaAsPercentage !== 0) {
                nextCursorFlags |=
                  deltaAsPercentage < 0
                    ? CursorFlags.horizontalMin
                    : CursorFlags.horizontalMax;
              }
              break;
            }
            case "vertical": {
              if (deltaAsPercentage !== 0) {
                nextCursorFlags |=
                  deltaAsPercentage < 0
                    ? CursorFlags.verticalMin
                    : CursorFlags.verticalMax;
              }
              break;
            }
          }
        }
      } else {
        transaction.proposedUpdate(unsafeLayout);
      }
    });
  } else {
    hitRegions = findMatchingHitRegions(event, groups);
  }

  // Edge case
  // Re-use previous horizontal/vertical cursor flags if there's been no movement since the last event
  // This accounts for edge cases in browsers like Firefox that sometimes round clientX/clientY values
  // See github.com/bvaughn/react-resizable-panels/issues/608
  let cursorFlags = 0;
  if (event.movementX === 0) {
    cursorFlags |= prevCursorFlags & CursorFlags.horizontal;
  } else {
    cursorFlags |= nextCursorFlags & CursorFlags.horizontal;
  }
  if (event.movementY === 0) {
    cursorFlags |= prevCursorFlags & CursorFlags.vertical;
  } else {
    cursorFlags |= nextCursorFlags & CursorFlags.vertical;
  }

  let state: "inactive" | "active" | "hover" = "inactive";
  if (pendingTransactions.length > 0) {
    state = "active";
  } else if (hitRegions.length > 0) {
    state = "hover";
  }

  cursorFlagsRef.current = cursorFlags;

  const cursorStyle = getCursorStyle({
    cursorFlags,
    groups: hitRegions.map((current) => current.group),
    state
  });

  updateCursorStyle({
    cursorStyle,
    ownerDocument: event.currentTarget as Document,
    state
  });
}
