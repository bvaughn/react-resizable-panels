import type { Layout } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { assert } from "../../utils/assert";
import { isArrayEqual } from "../../utils/isArrayEqual";
import { compareLayoutNumbers } from "../utils/compareLayoutNumbers";
import { layoutNumbersEqual } from "../utils/layoutNumbersEqual";
import { validatePanelSize } from "../utils/validatePanelSize";

// All units must be in percentages; pixel values should be pre-converted
export function adjustLayoutByDelta({
  delta,
  initialLayout: initialLayoutProp,
  panelConstraints: panelConstraintsArray,
  pivotIndices,
  prevLayout: prevLayoutProp,
  trigger
}: {
  delta: number;
  initialLayout: Layout;
  panelConstraints: PanelConstraints[];
  pivotIndices: number[];
  prevLayout: Layout;
  trigger?: "imperative-api" | "keyboard" | "mouse-or-touch";
}): Layout {
  if (layoutNumbersEqual(delta, 0)) {
    return initialLayoutProp;
  }

  const overrideDisabledPanels = trigger === "imperative-api";

  const initialLayout = panelConstraintsArray.map(
    ({ panelId }) => initialLayoutProp[panelId]
  );
  const prevLayout = panelConstraintsArray.map(
    ({ panelId }) => prevLayoutProp[panelId]
  );
  const nextLayout = [...initialLayout];

  const [firstPivotIndex, secondPivotIndex] = pivotIndices;
  assert(firstPivotIndex != null, "Invalid first pivot index");
  assert(secondPivotIndex != null, "Invalid second pivot index");

  let deltaApplied = 0;

  // A resizing panel affects the panels before or after it.
  //
  // A negative delta means the panel(s) immediately after the separator should grow/expand by decreasing its offset.
  // Other panels may also need to shrink/contract (and shift) to make room, depending on the min weights.
  //
  // A positive delta means the panel(s) immediately before the separator should "expand".
  // This is accomplished by shrinking/contracting (and shifting) one or more of the panels after the separator.

  {
    switch (trigger) {
      case "keyboard": {
        // If this is a resize triggered by a keyboard event, our logic for expanding/collapsing is different.
        // We no longer check the halfway threshold because this may prevent the panel from expanding at all.
        {
          // Check if we should expand a collapsed panel
          const index = delta < 0 ? secondPivotIndex : firstPivotIndex;
          const panelConstraints = panelConstraintsArray[index];
          assert(
            panelConstraints,
            `Panel constraints not found for index ${index}`
          );

          const {
            collapsedSize = 0,
            collapsible,
            minSize = 0
          } = panelConstraints;

          if (collapsible) {
            const prevSize = initialLayout[index];
            assert(
              prevSize != null,
              `Previous layout not found for panel index ${index}`
            );

            if (layoutNumbersEqual(prevSize, collapsedSize)) {
              const localDelta = minSize - prevSize;

              if (compareLayoutNumbers(localDelta, Math.abs(delta)) > 0) {
                delta = delta < 0 ? 0 - localDelta : localDelta;
              }
            }
          }
        }

        {
          // Check if we should collapse a panel at its minimum size
          const index = delta < 0 ? firstPivotIndex : secondPivotIndex;
          const panelConstraints = panelConstraintsArray[index];
          assert(
            panelConstraints,
            `No panel constraints found for index ${index}`
          );

          const {
            collapsedSize = 0,
            collapsible,
            minSize = 0
          } = panelConstraints;

          if (collapsible) {
            const prevSize = initialLayout[index];
            assert(
              prevSize != null,
              `Previous layout not found for panel index ${index}`
            );

            if (layoutNumbersEqual(prevSize, minSize)) {
              const localDelta = prevSize - collapsedSize;

              if (compareLayoutNumbers(localDelta, Math.abs(delta)) > 0) {
                delta = delta < 0 ? 0 - localDelta : localDelta;
              }
            }
          }
        }
        break;
      }
      default: {
        // If we're starting from a collapsed state, dragging past the threshold should cause the panel to expand
        // This can happen for positive or negative drags, and panels on either side of the separator can be collapsible
        // The easiest way to support this is to detect this scenario and pre-adjust the delta before applying the rest of the layout algorithm

        const index = delta < 0 ? secondPivotIndex : firstPivotIndex;
        const panelConstraints = panelConstraintsArray[index];
        assert(
          panelConstraints,
          `Panel constraints not found for index ${index}`
        );

        const prevSize = initialLayout[index];

        const { collapsedSize, collapsedThreshold, collapsible, minSize } =
          panelConstraints;
        if (collapsible && compareLayoutNumbers(prevSize, minSize) < 0) {
          const gapSize = minSize - collapsedSize;
          const threshold = collapsedThreshold ?? gapSize / 2;
          const nextSize = prevSize + Math.abs(delta);

          if (compareLayoutNumbers(nextSize, minSize) < 0) {
            const comparison = compareLayoutNumbers(Math.abs(delta), threshold);
            // Preserve the existing boundary behavior when no threshold is specified.
            const expandAtBoundary =
              collapsedThreshold === undefined && delta < 0;
            if (comparison > 0 || (comparison === 0 && expandAtBoundary)) {
              delta = delta < 0 ? -gapSize : gapSize;
            } else {
              delta = 0;
            }
          }
        }
        break;
      }
    }
  }

  {
    // Pre-calculate max available delta in the opposite direction of our pivot.
    // This will be the maximum amount we're allowed to expand/contract the panels in the primary direction.
    // If this amount is less than the requested delta, adjust the requested delta.
    // If this amount is greater than the requested delta, that's useful information too–
    // as an expanding panel might change from collapsed to min size.

    const increment = delta < 0 ? 1 : -1;

    let index = delta < 0 ? secondPivotIndex : firstPivotIndex;
    let maxAvailableDelta = 0;

    while (true) {
      const prevSize = initialLayout[index];
      assert(
        prevSize != null,
        `Previous layout not found for panel index ${index}`
      );

      const maxSafeSize = validatePanelSize({
        overrideDisabledPanels,
        panelConstraints: panelConstraintsArray[index],
        prevSize,
        size: 100
      });
      const delta = maxSafeSize - prevSize;

      maxAvailableDelta += delta;
      index += increment;

      if (index < 0 || index >= panelConstraintsArray.length) {
        break;
      }
    }

    const minAbsDelta = Math.min(Math.abs(delta), Math.abs(maxAvailableDelta));
    delta = delta < 0 ? 0 - minAbsDelta : minAbsDelta;
  }

  {
    // Delta added to a panel needs to be subtracted from other panels (within the constraints that those panels allow).

    const pivotIndex = delta < 0 ? firstPivotIndex : secondPivotIndex;
    let index = pivotIndex;
    while (index >= 0 && index < panelConstraintsArray.length) {
      const deltaRemaining = Math.abs(delta) - Math.abs(deltaApplied);

      const prevSize = initialLayout[index];
      assert(
        prevSize != null,
        `Previous layout not found for panel index ${index}`
      );

      const unsafeSize = prevSize - deltaRemaining;
      const safeSize = validatePanelSize({
        overrideDisabledPanels,
        panelConstraints: panelConstraintsArray[index],
        prevSize,
        size: unsafeSize
      });

      if (!layoutNumbersEqual(prevSize, safeSize)) {
        deltaApplied += prevSize - safeSize;

        nextLayout[index] = safeSize;

        if (
          deltaApplied
            .toFixed(3)
            .localeCompare(Math.abs(delta).toFixed(3), undefined, {
              numeric: true
            }) >= 0
        ) {
          break;
        }
      }

      if (delta < 0) {
        index--;
      } else {
        index++;
      }
    }
  }

  // If we were unable to resize any of the panels panels, return the previous state.
  // This will essentially bailout and ignore e.g. drags past a panel's boundaries
  if (isArrayEqual(prevLayout, nextLayout)) {
    return prevLayoutProp;
  }

  {
    // Now distribute the applied delta to the panels in the other direction
    const pivotIndex = delta < 0 ? secondPivotIndex : firstPivotIndex;

    const prevSize = initialLayout[pivotIndex];
    assert(
      prevSize != null,
      `Previous layout not found for panel index ${pivotIndex}`
    );

    const unsafeSize = prevSize + deltaApplied;
    const safeSize = validatePanelSize({
      overrideDisabledPanels,
      panelConstraints: panelConstraintsArray[pivotIndex],
      prevSize,
      size: unsafeSize
    });

    // Adjust the pivot panel before, but only by the amount that surrounding panels were able to shrink/contract.
    nextLayout[pivotIndex] = safeSize;

    // Edge case where expanding or contracting one panel caused another one to change collapsed state
    if (!layoutNumbersEqual(safeSize, unsafeSize)) {
      let deltaRemaining = unsafeSize - safeSize;

      const pivotIndex = delta < 0 ? secondPivotIndex : firstPivotIndex;
      let index = pivotIndex;
      while (index >= 0 && index < panelConstraintsArray.length) {
        const prevSize = nextLayout[index];
        assert(
          prevSize != null,
          `Previous layout not found for panel index ${index}`
        );

        const unsafeSize = prevSize + deltaRemaining;
        const safeSize = validatePanelSize({
          overrideDisabledPanels,
          panelConstraints: panelConstraintsArray[index],
          prevSize,
          size: unsafeSize
        });

        if (!layoutNumbersEqual(prevSize, safeSize)) {
          deltaRemaining -= safeSize - prevSize;

          nextLayout[index] = safeSize;
        }

        if (layoutNumbersEqual(deltaRemaining, 0)) {
          break;
        }

        if (delta > 0) {
          index--;
        } else {
          index++;
        }
      }
    }
  }

  const totalSize = Object.values(nextLayout).reduce(
    (total, size) => size + total,
    0
  );

  // If our new layout doesn't add up to 100%, that means the requested delta can't be applied
  // In that case, fall back to our most recent valid layout
  // Allow for a small rounding difference, else e.g. 3 panel layouts may never be considered valid
  if (!layoutNumbersEqual(totalSize, 100, 0.1)) {
    return prevLayoutProp;
  }

  return nextLayout.reduce<Layout>((accumulated, current, index) => {
    accumulated[panelConstraintsArray[index].panelId] = current;
    return accumulated;
  }, {});
}
