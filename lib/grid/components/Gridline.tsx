"use client";

import { useCallback } from "react";
import type { HitRegion, RegisteredSeparator } from "../../global/types";
import { useId } from "../../shared/hooks/useId";
import { ResizeSeparator } from "../../shared/components/ResizeSeparator";
import {
  getGutterGridPlacement,
  getSeparatorCrossGridPlacement,
  isValidGridlineIndex
} from "../utils/gridPlacement";
import type { GridlineProps } from "../types";
import { useGridContext } from "../hooks/useGridContext";
import { getCrossAxis } from "../utils/getCrossAxis";

// Gridlines are registered with the Grid axis they resize;
// most of their behavior (aria attributes, keyboard and pointer interactions) is shared with Separators in a Group
function GridlineComponent(props: GridlineProps) {
  const {
    children,
    className,
    disabled,
    elementRef,
    style,
    type: axis
  } = props;

  const [index, crossStartProp, crossSpan] =
    props.type === "column"
      ? [props.column, props.row, props.rowSpan]
      : [props.row, props.column, props.columnSpan];
  const crossStart = crossStartProp ?? 0;

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
  const crossAxis = getCrossAxis(axis);
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

/**
 * Resizes the columns (or rows) of a Grid.
 *
 * For example:
 *
 * ```tsx
 * // Rendered between columns 0 and 1 and spans all rows
 * <Gridline type="column" column={1} />
 * ```
 *
 * ```tsx
 * // Rendered between rows 0 and 1 and spans all columns
 * <Gridline type="row" row={1} />
 * ```
 *
 * ```tsx
 * // Rendered between columns 0 and 1 alongside of row 2 only
 * <Gridline type="column" column={1} row={2} rowSpan={1} />
 * ```
 *
 * A gridline should not be rendered alongside of a Cell that spans across its boundary
 * (this includes disabled gridlines; in development builds, an error will be logged to the console);
 * render multiple gridlines along the same boundary instead (e.g. before and after the spanning Cell).
 *
 * ℹ️ Once a boundary contains a gridline, it can only be resized using gridlines;
 * the parts of the boundary that aren't alongside of a gridline can't be dragged.
 *
 * Where column and row gridlines intersect, dragging resizes both axes.
 *
 * Gridlines are not _required_ but they are _recommended_ as they improve keyboard accessibility.
 *
 * Gridline elements always include the following attributes:
 *
 * ```html
 * <div aria-orientation="vertical" data-separator role="separator">
 * ```
 *
 * ℹ️ Column gridlines are vertical (`aria-orientation="vertical"`) and row gridlines are horizontal (`aria-orientation="horizontal"`).
 *
 * ℹ️ In addition to the attributes shown above, gridlines also render all required [WAI-ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role#associated_wai-aria_roles_states_and_properties).
 *
 * ⚠️ Gridline elements must be direct DOM children of their parent Grid elements.
 *
 * ℹ️ Gridlines rendered by another component (rather than directly within the Grid) aren't detected until they mount, so server-rendered layouts may shift slightly during hydration.
 */
export const Gridline = /* @__PURE__ */ Object.assign(GridlineComponent, {
  displayName: "Gridline"
});
