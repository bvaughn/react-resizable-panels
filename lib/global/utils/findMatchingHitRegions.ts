import { calculateHitRegions } from "../dom/calculateHitRegions";
import type { MountedAxes } from "../mutable-state/axes";
import type { HitRegion } from "../types";
import { findClosestHitRegion } from "./findClosestHitRegion";
import { isViableHitTarget } from "./isViableHitTarget";

export function findMatchingHitRegions(
  event: {
    clientX: number;
    clientY: number;
    target: EventTarget | null;
  },
  mountedAxes: MountedAxes,
  ownerDocument: Document
): HitRegion[] {
  const matchingHitRegions: HitRegion[] = [];

  mountedAxes.forEach((_, axisData) => {
    if (axisData.disabled) {
      return;
    }

    // Groups may be mounted in more than one document (e.g. a popup window)
    // Pointer coordinates are only meaningful within the document the event was dispatched to
    if (axisData.element.ownerDocument !== ownerDocument) {
      return;
    }

    const hitRegions = calculateHitRegions({ axis: axisData });
    const match = findClosestHitRegion(axisData.orientation, hitRegions, {
      x: event.clientX,
      y: event.clientY
    });
    if (
      match &&
      match.distance.x <= 0 &&
      match.distance.y <= 0 &&
      isViableHitTarget({
        axisElement: axisData.element,
        hitRegion: match.hitRegion.rect,
        pointerEventTarget: event.target
      })
    ) {
      matchingHitRegions.push(match.hitRegion);
    }
  });

  return matchingHitRegions;
}
