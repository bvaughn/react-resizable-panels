import type { HitRegion } from "../types";

/**
 * Hit regions are recalculated on every pointer move;
 * two lists are considered equal if they target the same axes, separators, and items (in the same order).
 * Rects (and axis sizes) are ignored because they are re-measured when an interaction starts.
 */
export function hitRegionsEqual(a: HitRegion[], b: HitRegion[]) {
  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index++) {
    const prev = a[index];
    const next = b[index];
    if (
      prev.axis !== next.axis ||
      prev.separator !== next.separator ||
      prev.items[0] !== next.items[0] ||
      prev.items[1] !== next.items[1]
    ) {
      return false;
    }
  }

  return true;
}
