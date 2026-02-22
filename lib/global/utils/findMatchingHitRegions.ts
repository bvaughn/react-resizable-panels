import {
  calculateHitRegions,
  type HitRegion
} from "../dom/calculateHitRegions";
import type { MountedGroups } from "../mutable-state/groups";
import { findClosestHitRegion } from "./findClosestHitRegion";
import { isViableHitTarget } from "./isViableHitTarget";

export function findMatchingHitRegions(
  event: {
    clientX: number;
    clientY: number;
    target: EventTarget | null;
  },
  mountedGroups: MountedGroups
): HitRegion[] {
  const matchingHitRegions: HitRegion[] = [];

  mountedGroups.forEach((_, groupData) => {
    if (groupData.disabled) {
      return;
    }

    const hitRegions = calculateHitRegions(groupData);
    const match = findClosestHitRegion(groupData.orientation, hitRegions, {
      x: event.clientX,
      y: event.clientY
    });
    if (
      match &&
      match.distance.x <= 0 &&
      match.distance.y <= 0 &&
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
