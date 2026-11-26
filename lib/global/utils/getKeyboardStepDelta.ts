import { assert } from "../../shared/utils/assert";
import type { MountedAxisState } from "../mutable-state/axes";
import type { RegisteredResizeAxis, RegisteredSeparator } from "../types";
import { findNearestValue } from "./findNearestValue";
import { getSnapDeltas } from "./getSnapDeltas";
import { layoutNumbersEqual } from "./layoutNumbersEqual";

// Percentage an arrow key moves a separator by (unless the items on either side of it have snap sizes)
const KEYBOARD_STEP = 5;

/**
 * Delta (a percentage) for an arrow key press on a separator:
 * the nearest snap size in that direction (if the items on either side of the separator have snap sizes),
 * otherwise the default step.
 *
 * Returns undefined if the separator should not move (because there are no snap sizes in that direction).
 */
export function getKeyboardStepDelta({
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
  const defaultDelta = direction * KEYBOARD_STEP;

  // A deferred layout (e.g. an axis mounted in a hidden DOM subtree) has not been validated, so it can't be snapped
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

  const deltasAhead = snapDeltas.filter(
    (delta) => direction * delta > 0 && !layoutNumbersEqual(delta, 0)
  );
  return findNearestValue(deltasAhead, 0);
}
