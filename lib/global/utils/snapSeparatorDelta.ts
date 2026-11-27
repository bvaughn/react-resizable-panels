import type { Layout, ResizeItemConstraints, SnapBehavior } from "../types";
import { findNearestValue } from "./findNearestValue";
import { getSnapDeltas } from "./getSnapDeltas";

/**
 * Adjusts a pointer-driven separator delta (a percentage) for the snap sizes of the items on either side of it:
 * the nearest snap size (or where the separator started, if that's nearer).
 *
 * The delta is returned unchanged if neither item has snap sizes,
 * or if the snap behavior is "on-release" and the pointer has not been `released` yet.
 */
export function snapSeparatorDelta({
  delta,
  initialLayout,
  itemConstraints,
  pivotIndices,
  released,
  snapBehavior
}: {
  delta: number;
  initialLayout: Layout;
  itemConstraints: ResizeItemConstraints[];
  pivotIndices: number[];
  released: boolean;
  snapBehavior: SnapBehavior;
}): number {
  if (snapBehavior === "on-release" && !released) {
    return delta;
  }

  const snapDeltas = getSnapDeltas({
    initialLayout,
    itemConstraints,
    pivotIndices,
    trigger: "mouse-or-touch"
  });
  if (snapDeltas.length === 0) {
    return delta;
  }

  return findNearestValue([...snapDeltas, 0], delta) ?? delta;
}
