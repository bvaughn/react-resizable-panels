import { assert } from "../../shared/utils/assert";
import type { MountedAxisState } from "../mutable-state/axes";
import type { RegisteredResizeAxis, RegisteredSeparator } from "../types";
import { getSnapDeltas } from "./getSnapDeltas";

/**
 * Delta (a percentage) for a Home (-1) or End (1) key press on a separator:
 * the furthest snap size in that direction (if the items on either side of the separator have snap sizes),
 * otherwise a delta large enough to reach the item's minimum or maximum size.
 *
 * Returns undefined if the separator should not move.
 */
export function getKeyboardEdgeDelta({
  axis,
  axisState,
  direction,
  separator
}: {
  axis: RegisteredResizeAxis;
  axisState: MountedAxisState;
  direction: -1 | 1;
  separator: RegisteredSeparator;
}): number | undefined {
  const defaultDelta = direction * 100;

  if (axisState.defaultLayoutDeferred) {
    return defaultDelta;
  }

  const items = axisState.separatorToItems.get(separator);
  assert(items, "Matching panels not found");

  const snapDeltas = getSnapDeltas({
    initialLayout: axisState.layout,
    itemConstraints: axisState.derivedItemConstraints,
    pivotIndices: items.map((item) => axis.items.indexOf(item)),
    trigger: "keyboard"
  });
  if (snapDeltas.length === 0) {
    return defaultDelta;
  }

  const deltasAhead = snapDeltas.filter((delta) => direction * delta > 0);
  return deltasAhead.length > 0
    ? direction * Math.max(...deltasAhead.map((delta) => direction * delta))
    : undefined;
}
