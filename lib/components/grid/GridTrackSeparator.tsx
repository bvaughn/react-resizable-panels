"use client";

import {
  useCallback,
  type CSSProperties,
  type ReactNode,
  type Ref
} from "react";
import type { HitRegion, RegisteredSeparator } from "../../global/types";
import { useId } from "../../hooks/useId";
import { ResizeSeparator } from "../shared/ResizeSeparator";
import {
  getGutterGridPlacement,
  getSeparatorCrossGridPlacement,
  isValidGridlineIndex
} from "./gridPlacement";
import type { GridAxis } from "./types";
import { useGridContext } from "./useGridContext";

/**
 * @internal
 * Implementation of Gridline.
 *
 * Gridlines are registered with the Grid axis they resize;
 * most of their behavior (aria attributes, keyboard and pointer interactions) is shared with Separators in a Group
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
  const id = useId(undefined);

  const {
    getDisableCursor,
    getResizeAxisId,
    gutters,
    registerSeparator,
    separatorPlacements,
    trackCounts,
    updateSeparatorProps
  } = useGridContext();

  const axisId = getResizeAxisId(axis);
  const crossAxis: GridAxis = axis === "column" ? "row" : "column";
  const crossCount = trackCounts[crossAxis];

  // Invalid placements are logged by the Grid (see getPlacementErrors);
  // a gridline that isn't between two tracks can't resize anything, so it's treated as disabled
  const isDisabled =
    !!disabled || !isValidGridlineIndex(index, trackCounts[axis]);

  // Only one gridline per boundary should be included in the tab order;
  // (they all resize the same tracks)
  let isFirstEnabledGridlineOnBoundary = true;
  for (const placement of separatorPlacements.values()) {
    if (
      placement.axis === axis &&
      placement.index === index &&
      !placement.disabled &&
      placement.crossStart < crossStart
    ) {
      isFirstEnabledGridlineOnBoundary = false;
      break;
    }
  }

  // Gridlines along the same boundary resize the same tracks and so share hover/active state
  const isSharedHitRegion = useCallback(
    (hitRegion: HitRegion) =>
      hitRegion.axis.id === axisId &&
      hitRegion.axis.items.indexOf(hitRegion.items[1]) === index,
    [axisId, index]
  );

  const registerGridline = useCallback(
    (separator: RegisteredSeparator) =>
      registerSeparator(
        {
          axis,
          crossSpan,
          crossStart,
          disabled: !!disabled,
          index
        },
        separator
      ),
    [axis, crossSpan, crossStart, disabled, index, registerSeparator]
  );

  // Gridlines are rendered within the gutter track between two content tracks
  const gutterPlacement = getGutterGridPlacement(index);
  const crossPlacement = getSeparatorCrossGridPlacement({
    crossCount,
    crossSpan,
    crossStart,
    hasGutters: gutters[crossAxis]
  });

  return (
    <ResizeSeparator
      axisId={axisId}
      axisOrientation={axis === "column" ? "horizontal" : "vertical"}
      className={className}
      disableCursor={getDisableCursor()}
      disabled={isDisabled}
      disableDoubleClick={undefined}
      elementRef={elementRef}
      id={id}
      isSharedHitRegion={isSharedHitRegion}
      registerSeparator={registerGridline}
      requiredStyle={{
        gridColumn: axis === "column" ? gutterPlacement : crossPlacement,
        gridRow: axis === "row" ? gutterPlacement : crossPlacement
      }}
      style={style}
      tabIndex={isFirstEnabledGridlineOnBoundary ? 0 : -1}
      updateSeparatorProps={updateSeparatorProps}
    >
      {children}
    </ResizeSeparator>
  );
}
