import { DEFAULT_POINTER_PRECISION } from "../../constants";
import type { MountedGroupMap } from "../mutableState";
import {
  calculateHitRegions,
  type HitRegion
} from "../dom/calculateHitRegions";
import { findClosetHitRegion } from "./findClosetHitRegion";
import { isCoarsePointer } from "./isCoarsePointer";

export function findMatchingHitRegions(
  event: PointerEvent,
  mountedGroups: MountedGroupMap
): HitRegion[] {
  const matchingHitRegions: HitRegion[] = [];

  mountedGroups.forEach((_, groupData) => {
    if (groupData.disabled) {
      return;
    }

    const maxDistance = isCoarsePointer()
      ? DEFAULT_POINTER_PRECISION.coarse
      : DEFAULT_POINTER_PRECISION.precise;

    const hitRegions = calculateHitRegions(groupData);
    const match = findClosetHitRegion(groupData.direction, hitRegions, {
      x: event.clientX,
      y: event.clientY
    });

    if (
      match &&
      match.distance.x <= maxDistance &&
      match.distance.y <= maxDistance
    ) {
      matchingHitRegions.push(match.hitRegion);
    }
  });

  return matchingHitRegions;
}
