import { DEFAULT_POINTER_PRECISION } from "../../constants";
import {
  calculateHitRegions,
  type HitRegion
} from "../dom/calculateHitRegions";
import type { MountedGroupMap } from "../mutableState";
import { findClosetHitRegion } from "./findClosetHitRegion";
import { isCoarsePointer } from "./isCoarsePointer";
import { isViableHitTarget } from "./isViableHitTarget";

export function findMatchingHitRegions(
  event: {
    clientX: number;
    clientY: number;
    target: EventTarget | null;
  },
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
    const match = findClosetHitRegion(groupData.orientation, hitRegions, {
      x: event.clientX,
      y: event.clientY
    });

    if (
      match &&
      match.distance.x <= maxDistance &&
      match.distance.y <= maxDistance &&
      isViableHitTarget({
        groupElement: groupData.element,
        hitRegion: match.hitRegion.rect,
        pointerEventTarget: event.target
      })
    ) {
      matchingHitRegions.push(match.hitRegion);
    }
  });

  return matchingHitRegions;
}
