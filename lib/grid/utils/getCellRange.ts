import type { GridAxis, RegisteredCell } from "../types";

/**
 * Returns the placement of a Cell relative to the specified axis:
 * the track it starts at (and the number it spans) along the axis, followed by the same along the cross axis.
 */
export function getCellRange(
  cell: RegisteredCell,
  axis: GridAxis
): [start: number, span: number, crossStart: number, crossSpan: number] {
  return axis === "column"
    ? [cell.column, cell.columnSpan, cell.row, cell.rowSpan]
    : [cell.row, cell.rowSpan, cell.column, cell.columnSpan];
}
