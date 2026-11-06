import type { GridAxis, GridSegment } from "../types";

/**
 * Converts a rect to a segment relative to the specified axis
 * (e.g. for the column axis, start/end are left/right and crossStart/crossEnd are top/bottom)
 */
export function getRectSegment(rect: DOMRect, axis: GridAxis): GridSegment {
  return axis === "column"
    ? {
        crossEnd: rect.bottom,
        crossStart: rect.top,
        end: rect.right,
        start: rect.left
      }
    : {
        crossEnd: rect.right,
        crossStart: rect.left,
        end: rect.bottom,
        start: rect.top
      };
}
