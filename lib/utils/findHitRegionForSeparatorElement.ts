import { calculateHitRegions } from "../global/dom/calculateHitRegions";
import { assert } from "./assert";
import { findSeparatorForElement } from "./findSeparatorForElement";

export function findHitRegionForSeparatorElement(
  separatorElement: HTMLElement
) {
  const separator = findSeparatorForElement(separatorElement);

  const hitRegions = calculateHitRegions(separator.group);
  const hitRegion = hitRegions.find(
    (hitRegion) => hitRegion.separator === separator
  );

  assert(hitRegion, "Hit region not found");

  return hitRegion;
}
