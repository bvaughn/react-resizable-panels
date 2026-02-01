import {
  CURSOR_FLAG_HORIZONTAL_MAX,
  CURSOR_FLAG_HORIZONTAL_MIN,
  CURSOR_FLAG_VERTICAL_MAX,
  CURSOR_FLAG_VERTICAL_MIN,
  CURSOR_FLAGS_HORIZONTAL,
  CURSOR_FLAGS_VERTICAL
} from "../../constants";
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
        if (deltaAsPercentage !== 0 && !hitRegion.group.disableCursor) {
          switch (hitRegion.group.orientation) {
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
        transaction.proposedUpdate(unsafeLayout);
      }
    });
  } else {
    hitRegions = findMatchingHitRegions(event, groups);

    if (hitRegions.length) {
      hitRegions.forEach((hitRegion) => {
        switch (hitRegion.group.orientation) {
          case "horizontal": {
            nextCursorFlags |= CURSOR_FLAGS_HORIZONTAL;
            break;
          }
          case "vertical": {
            nextCursorFlags |= CURSOR_FLAGS_VERTICAL;
            break;
          }
        }
      });
    }
  }

  // Edge case
  // Re-use previous horizontal/vertical cursor flags if there's been no movement since the last event
  // This accounts for edge cases in browsers like Firefox that sometimes round clientX/clientY values
  // See github.com/bvaughn/react-resizable-panels/issues/608
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

  cursorFlagsRef.current = cursorFlags;

  const state = pendingTransactions.length
    ? "active"
    : cursorFlags === 0
      ? "inactive"
      : "hover";

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
