import {
  CURSOR_FLAG_HORIZONTAL_MAX,
  CURSOR_FLAG_HORIZONTAL_MIN,
  CURSOR_FLAG_VERTICAL_MAX,
  CURSOR_FLAG_VERTICAL_MIN,
  CURSOR_FLAGS_HORIZONTAL,
  CURSOR_FLAGS_VERTICAL
} from "../../constants";
import type { Point } from "../../types";
import {
  endAxisChangeBatch,
  startAxisChangeBatch,
  updateMountedAxis,
  type MountedAxes
} from "../mutable-state/axes";
import {
  getInteractionState,
  updateCursorFlags
} from "../mutable-state/interactions";
import type { HitRegion, Layout, RegisteredResizeAxis } from "../types";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { layoutsEqual } from "./layoutsEqual";

type Options = {
  commit: boolean;
  event: {
    clientX: number;
    clientY: number;
    movementX: number;
    movementY: number;
  };
  hitRegions: HitRegion[];
  initialLayoutMap: Map<RegisteredResizeAxis, Layout>;
  mountedAxes: MountedAxes;
  pointerDownAtPoint?: Point;
  prevCursorFlags: number;
};

export function updateActiveHitRegions(options: Options) {
  // Layout change callbacks may throw;
  // defer them until every group and the interaction state have been updated
  startAxisChangeBatch();
  try {
    updateActiveHitRegionsImpl(options);
  } finally {
    endAxisChangeBatch();
  }
}

function updateActiveHitRegionsImpl({
  commit,
  event,
  hitRegions,
  initialLayoutMap,
  mountedAxes,
  pointerDownAtPoint,
  prevCursorFlags
}: Options) {
  let nextCursorFlags = 0;
  const interaction = getInteractionState();
  let previews = interaction.state === "active" ? interaction.previews : [];
  const previewLayoutMap = new Map(
    interaction.state === "active" ? interaction.previewLayoutMap : undefined
  );

  // Note that HitRegions are frozen once a drag has started
  // Modify the Group layouts for all matching HitRegions though
  hitRegions.forEach((current) => {
    const { axis, axisSize } = current;
    const { orientation, items } = axis;
    if (commit && axis.resizePreviewMode !== "separator") {
      return;
    }
    const { disableCursor } = axis.mutableState;

    let deltaAsPercentage = 0;
    if (pointerDownAtPoint) {
      if (orientation === "horizontal") {
        deltaAsPercentage =
          ((event.clientX - pointerDownAtPoint.x) / axisSize) * 100;
      } else {
        deltaAsPercentage =
          ((event.clientY - pointerDownAtPoint.y) / axisSize) * 100;
      }
    } else {
      if (orientation === "horizontal") {
        deltaAsPercentage = event.clientX < 0 ? -100 : 100;
      } else {
        deltaAsPercentage = event.clientY < 0 ? -100 : 100;
      }
    }

    const initialLayout = initialLayoutMap.get(axis);
    const axisState = mountedAxes.get(axis);
    if (!initialLayout || !axisState) {
      return;
    }

    const {
      defaultLayoutDeferred,
      derivedItemConstraints,
      axisSize: mountedAxisSize,
      layout: mountedLayout,
      separatorToItems
    } = axisState;
    if (derivedItemConstraints && mountedLayout && separatorToItems) {
      const prevLayout =
        axis.resizePreviewMode === "separator"
          ? (previewLayoutMap.get(axis) ?? mountedLayout)
          : mountedLayout;
      const nextLayout = adjustLayoutByDelta({
        delta: deltaAsPercentage,
        initialLayout,
        itemConstraints: derivedItemConstraints,
        pivotIndices: current.items.map((item) => items.indexOf(item)),
        prevLayout,
        trigger: "mouse-or-touch"
      });

      // Preview every moved boundary, deferring the layout update until release.
      if (
        axis.resizePreviewMode === "separator" &&
        !commit &&
        !layoutsEqual(nextLayout, prevLayout)
      ) {
        previewLayoutMap.set(axis, nextLayout);

        let total = 0;
        const offsets = items.map((item) => {
          total += nextLayout[item.id] - initialLayout[item.id];
          return total * (axisSize / 100);
        });

        previews = previews.map((preview) => {
          if (preview.axis !== axis) {
            return preview;
          }

          const offset = offsets[preview.itemIndex];
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
        (axis.resizePreviewMode !== "separator" || commit) &&
        !layoutsEqual(nextLayout, mountedLayout)
      ) {
        updateMountedAxis(current.axis, {
          defaultLayoutDeferred,
          derivedItemConstraints,
          axisSize: mountedAxisSize,
          layout: nextLayout,
          requestedAxisSize: mountedAxisSize,
          requestedLayout: nextLayout,
          separatorToItems
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
}
