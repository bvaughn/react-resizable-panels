import type { Orientation } from "../components/group/types";
import type { Rect } from "../types";
import { assert } from "./assert";
import { getDistanceBetweenPointAndRect } from "./getDistanceBetweenPointAndRect";

export function findClosestRect({
  orientation,
  rects,
  targetRect
}: {
  orientation: Orientation;
  rects: Rect[];
  targetRect: Rect;
}): Rect {
  const centerPoint = {
    x: targetRect.x + targetRect.width / 2,
    y: targetRect.y + targetRect.height / 2
  };

  let closestRect: Rect | undefined = undefined;
  let minDistance = Number.MAX_VALUE;

  for (const rect of rects) {
    const { x, y } = getDistanceBetweenPointAndRect(centerPoint, rect);

    const distance = orientation === "horizontal" ? x : y;

    if (distance < minDistance) {
      minDistance = distance;
      closestRect = rect;
    }
  }

  assert(closestRect, "No rect found");

  return closestRect;
}
