import type { GridAxis, GridSegment } from "../types";

/**
 * Converts a segment (relative to the specified axis) to a rect; the inverse of getRectSegment
 */
export function segmentToRect(
  { crossEnd, crossStart, end, start }: GridSegment,
  axis: GridAxis
): DOMRect {
  return axis === "column"
    ? new DOMRect(start, crossStart, end - start, crossEnd - crossStart)
    : new DOMRect(crossStart, start, crossEnd - crossStart, end - start);
}
