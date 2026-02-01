import {
  calculateHitRegions,
  type HitRegion
} from "../global/dom/calculateHitRegions";
import type { MutableGroup } from "../state/MutableGroup";
import { assert } from "./assert";
import { findClosestHitRegion } from "./findClosestHitRegion";
import { getOwnerDocument } from "./getOwnerDocument";
import { isViableHitTarget } from "./isViableHitTarget";

export function findMatchingHitRegions(
  event: {
    clientX: number;
    clientY: number;
    currentTarget: EventTarget | null;
    target: EventTarget | null;
  },
  groups: MutableGroup[]
): HitRegion[] {
  const matchingHitRegions: HitRegion[] = [];

  groups.forEach((group) => {
    if (group.disabled) {
      return;
    }

    const ownerDocument = getOwnerDocument(event.currentTarget);

    const groupElement = ownerDocument.querySelector(
      `[data-group][id="${group.id}"]`
    );
    assert(
      groupElement instanceof HTMLElement,
      `Could not find HTMLElement for Group ${group.id}`
    );

    const hitRegions = calculateHitRegions(group);
    const match = findClosestHitRegion(group.orientation, hitRegions, {
      x: event.clientX,
      y: event.clientY
    });
    if (
      match &&
      match.distance.x <= 0 &&
      match.distance.y <= 0 &&
      isViableHitTarget({
        groupElement,
        hitRegion: match.hitRegion.rect,
        pointerEventTarget: event.target
      })
    ) {
      matchingHitRegions.push(match.hitRegion);
    }
  });

  return matchingHitRegions;
}
