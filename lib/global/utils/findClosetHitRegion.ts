import type { Direction } from "../../components/group/types";
import type { Point } from "../../types";
import type { HitRegion } from "../dom/calculateHitRegions";
import { getDistanceBetweenPointAndRect } from "./getDistanceBetweenPointAndRect";

export function findClosetHitRegion(
  direction: Direction,
  hitRegions: HitRegion[],
  point: Point
) {
  let closestHitRegion: HitRegion | undefined = undefined;
  let minDistance = {
    x: Infinity,
    y: Infinity
  };

  for (const hitRegion of hitRegions) {
    const data = getDistanceBetweenPointAndRect(point, hitRegion.rect);
    switch (direction) {
      case "horizontal": {
        if (data.x <= minDistance.x) {
          closestHitRegion = hitRegion;
          minDistance = data;
        }
        break;
      }
      case "vertical": {
        if (data.y <= minDistance.y) {
          closestHitRegion = hitRegion;
          minDistance = data;
        }
        break;
      }
    }
  }

  return closestHitRegion
    ? {
        distance: minDistance,
        hitRegion: closestHitRegion
      }
    : undefined;
}
