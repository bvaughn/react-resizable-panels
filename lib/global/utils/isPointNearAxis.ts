import type { Point } from "../../types";
import type { RegisteredResizeAxis } from "../types";

/**
 * Cheap pre-check (one rect measurement) before calculating an axis's hit regions.
 *
 * Hit regions are derived from the axis's items and separators, which are contained by the axis element;
 * thin regions are expanded (centered) to the minimum resize target size,
 * so they may extend past the edge of the axis element by up to half of that size.
 * Inflating the axis rect by the larger of the (coarse and fine) minimum sizes covers that.
 */
export function isPointNearAxis(axis: RegisteredResizeAxis, point: Point) {
  const { coarse, fine } = axis.resizeTargetMinimumSize;
  const margin = Math.max(coarse, fine);

  const rect = axis.element.getBoundingClientRect();

  return (
    point.x >= rect.left - margin &&
    point.x <= rect.right + margin &&
    point.y >= rect.top - margin &&
    point.y <= rect.bottom + margin
  );
}
