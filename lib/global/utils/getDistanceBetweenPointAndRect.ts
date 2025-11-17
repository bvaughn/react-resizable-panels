import type { Point } from "../../types";

export function getDistanceBetweenPointAndRect(point: Point, rect: DOMRect) {
  return {
    x:
      point.x >= rect.left && point.x <= rect.right
        ? 0
        : Math.min(
            Math.abs(point.x - rect.left),
            Math.abs(point.x - rect.right)
          ),
    y:
      point.y >= rect.top && point.y <= rect.bottom
        ? 0
        : Math.min(
            Math.abs(point.y - rect.top),
            Math.abs(point.y - rect.bottom)
          )
  };
}
