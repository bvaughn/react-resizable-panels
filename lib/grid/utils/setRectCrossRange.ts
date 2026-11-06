import type { GridAxis } from "../types";

/**
 * Returns a copy of the rect with its position along the cross axis replaced
 * (e.g. for the column axis, its top and bottom); its position along the axis is unchanged
 */
export function setRectCrossRange(
  rect: DOMRect,
  axis: GridAxis,
  crossStart: number,
  crossEnd: number
): DOMRect {
  return axis === "column"
    ? new DOMRect(rect.x, crossStart, rect.width, crossEnd - crossStart)
    : new DOMRect(crossStart, rect.y, crossEnd - crossStart, rect.height);
}
