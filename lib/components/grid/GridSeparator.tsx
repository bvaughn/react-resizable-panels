"use client";

import { useMemo } from "react";
import { NOOP_FUNCTION } from "../../constants";
import { assert } from "../../utils/assert";
import { GroupContext } from "../group/GroupContext";
import type { GroupContextType } from "../group/types";
import { Separator } from "../separator/Separator";
import type { RegisteredSeparator } from "../separator/types";
import { getGutterGridPlacement, getTrackGridPlacement } from "./gridPlacement";
import type {
  GridAxis,
  GridSeparatorPlacement,
  GridSeparatorProps
} from "./types";
import { useGridContext } from "./useGridContext";

/**
 * GridSeparators are not _required_ but they are _recommended_ as they improve keyboard accessibility.
 *
 * A separator resizes either the columns or the rows of a Grid:
 * - `<GridSeparator column={1} />` is rendered between columns 0 and 1 (and spans all rows)
 * - `<GridSeparator row={1} />` is rendered between rows 0 and 1 (and spans all columns)
 *
 * Separators can also span a subset of the opposite axis (e.g. `<GridSeparator column={1} rowStart={1} rowSpan={2} />`).
 *
 * Where column and row separators intersect, dragging resizes both axes.
 *
 * GridSeparators support the same props and attributes as Separators:
 *
 * ```html
 * <div data-separator data-testid="separator-id-prop" id="separator-id-prop" role="separator">
 * ```
 *
 * ⚠️ GridSeparator elements must be direct DOM children of their parent Grid elements.
 */
export function GridSeparator({
  column,
  columnSpan,
  columnStart,
  row,
  rowSpan,
  rowStart,
  style,
  ...rest
}: GridSeparatorProps) {
  const grid = useGridContext();

  const axis: GridAxis = column !== undefined ? "column" : "row";
  const index = axis === "column" ? column : row;
  const crossStart = (axis === "column" ? rowStart : columnStart) ?? 0;
  const crossSpan = axis === "column" ? rowSpan : columnSpan;

  const trackCount = grid.trackCounts[axis];
  const crossTrackCount =
    grid.trackCounts[axis === "column" ? "row" : "column"];

  assert(
    index !== undefined &&
      Number.isInteger(index) &&
      index >= 1 &&
      index < trackCount,
    `Invalid GridSeparator ${axis} (${index}); must be between 1 and ${trackCount - 1}`
  );
  assert(
    crossStart >= 0 &&
      (crossSpan === undefined ||
        (crossSpan >= 1 && crossStart + crossSpan <= crossTrackCount)),
    `Invalid GridSeparator placement; Grid has ${crossTrackCount} ${axis === "column" ? "rows" : "columns"}`
  );

  const {
    getDisableCursor,
    getGroupId,
    registerSeparator,
    updateSeparatorProps
  } = grid;

  // Separators within a Grid are registered with the Grid axis they resize;
  // Most of their behavior (aria attributes, keyboard and pointer interactions) is shared with Separators in a Group
  const groupContext = useMemo<GroupContextType>(() => {
    const placement: GridSeparatorPlacement = {
      axis,
      crossSpan,
      crossStart,
      index
    };

    return {
      get disableCursor() {
        return getDisableCursor();
      },
      getPanelStyles: () => undefined,
      id: getGroupId(axis),
      orientation: axis === "column" ? "horizontal" : "vertical",
      registerOverlay: () => NOOP_FUNCTION,
      registerPanel: () => {
        throw Error(
          "Panels cannot be rendered within a Grid; use Cell instead"
        );
      },
      registerSeparator: (separator: RegisteredSeparator) =>
        registerSeparator(placement, separator),
      updatePanelProps: NOOP_FUNCTION,
      updateSeparatorProps
    };
  }, [
    axis,
    crossSpan,
    crossStart,
    getDisableCursor,
    getGroupId,
    index,
    registerSeparator,
    updateSeparatorProps
  ]);

  const crossPlacement = getTrackGridPlacement(
    crossStart,
    crossSpan,
    grid.gutters[axis === "column" ? "row" : "column"]
  );

  return (
    <GroupContext.Provider value={groupContext}>
      <Separator
        {...rest}
        style={{
          ...style,

          gridColumn:
            axis === "column" ? getGutterGridPlacement(index) : crossPlacement,
          gridRow:
            axis === "row" ? getGutterGridPlacement(index) : crossPlacement
        }}
      />
    </GroupContext.Provider>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
GridSeparator.displayName = "GridSeparator";
