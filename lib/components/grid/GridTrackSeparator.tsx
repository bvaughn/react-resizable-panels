"use client";

import { useMemo, type CSSProperties, type ReactNode, type Ref } from "react";
import { NOOP_FUNCTION } from "../../constants";
import type { HitRegion } from "../../global/dom/calculateHitRegions";
import { GroupContext } from "../group/GroupContext";
import type { GroupContextType } from "../group/types";
import { Separator } from "../separator/Separator";
import type { RegisteredSeparator } from "../separator/types";
import {
  getGutterGridPlacement,
  getSeparatorCrossGridPlacement,
  isValidGridlineIndex
} from "./gridPlacement";
import type { GridAxis, GridSeparatorPlacement } from "./types";
import { useGridContext } from "./useGridContext";

/**
 * @internal
 * Implementation of Gridline.
 *
 * Separators within a Grid are registered with the Grid axis they resize;
 * Most of their behavior (aria attributes, keyboard and pointer interactions) is shared with Separators in a Group
 */
export function GridTrackSeparator({
  axis,
  children,
  className,
  crossSpan,
  crossStart,
  disabled,
  elementRef,
  index,
  style
}: {
  axis: GridAxis;
  children: ReactNode | undefined;
  className: string | undefined;
  crossSpan: number | undefined;
  crossStart: number;
  disabled: boolean | undefined;
  elementRef: Ref<HTMLDivElement> | undefined;
  index: number;
  style: CSSProperties | undefined;
}) {
  const {
    getDisableCursor,
    getGroupId,
    gutters,
    registerSeparator,
    separatorPlacements,
    trackCounts,
    updateSeparatorProps
  } = useGridContext();

  const crossAxis: GridAxis = axis === "column" ? "row" : "column";
  const crossCount = trackCounts[crossAxis];

  // Invalid placements are logged by the Grid (see getPlacementErrors);
  // a gridline that isn't between two tracks can't resize anything, so it's treated as disabled
  const isDisabled =
    !!disabled || !isValidGridlineIndex(index, trackCounts[axis]);

  // Only one separator per boundary should be included in the tab order;
  // (they all resize the same tracks)
  let isFirstEnabledSeparatorOnBoundary = true;
  for (const placement of separatorPlacements.values()) {
    if (
      placement.axis === axis &&
      placement.index === index &&
      !placement.disabled &&
      placement.crossStart < crossStart
    ) {
      isFirstEnabledSeparatorOnBoundary = false;
      break;
    }
  }
  const separatorTabIndex = isFirstEnabledSeparatorOnBoundary ? 0 : -1;

  const groupContext = useMemo<GroupContextType>(() => {
    const groupId = getGroupId(axis);
    const placement: GridSeparatorPlacement = {
      axis,
      crossSpan,
      crossStart,
      disabled: !!disabled,
      index
    };

    return {
      get disableCursor() {
        return getDisableCursor();
      },
      getPanelStyles: () => undefined,
      id: groupId,
      isSeparatorHitRegion: (hitRegion: HitRegion) =>
        hitRegion.group.id === groupId &&
        hitRegion.group.panels.indexOf(hitRegion.panels[1]) === index,
      orientation: axis === "column" ? "horizontal" : "vertical",
      registerOverlay: () => NOOP_FUNCTION,
      registerPanel: () => {
        throw Error(
          "Panels cannot be rendered within a Grid; use Cell instead"
        );
      },
      registerSeparator: (separator: RegisteredSeparator) =>
        registerSeparator(placement, separator),
      separatorTabIndex,
      updatePanelProps: NOOP_FUNCTION,
      updateSeparatorProps
    };
  }, [
    axis,
    crossSpan,
    crossStart,
    disabled,
    getDisableCursor,
    getGroupId,
    index,
    registerSeparator,
    separatorTabIndex,
    updateSeparatorProps
  ]);

  // Separators are rendered within the gutter track between two content tracks
  const gutterPlacement = getGutterGridPlacement(index);
  const crossPlacement = getSeparatorCrossGridPlacement({
    crossCount,
    crossSpan,
    crossStart,
    hasGutters: gutters[crossAxis]
  });

  return (
    <GroupContext.Provider value={groupContext}>
      <Separator
        className={className}
        disabled={isDisabled}
        elementRef={elementRef}
        style={{
          ...style,

          gridColumn: axis === "column" ? gutterPlacement : crossPlacement,
          gridRow: axis === "row" ? gutterPlacement : crossPlacement
        }}
      >
        {children}
      </Separator>
    </GroupContext.Provider>
  );
}
