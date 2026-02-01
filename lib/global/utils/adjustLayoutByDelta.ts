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

  const initialLayout = Object.values(initialLayoutProp);
  const prevLayout = Object.values(prevLayoutProp);
  const nextLayout = [...initialLayout];

  const [firstPivotIndex, secondPivotIndex] = pivotIndices;
  assert(firstPivotIndex != null, "Invalid first pivot index");
  assert(secondPivotIndex != null, "Invalid second pivot index");

  let deltaApplied = 0;

  // const DEBUG = [];
  // DEBUG.push(`adjustLayoutByDelta()`);
  // DEBUG.push(`  initialLayout: ${initialLayout.join(", ")}`);
  // DEBUG.push(`  prevLayout: ${prevLayout.join(", ")}`);
  // DEBUG.push(`  delta: ${delta}`);
  // DEBUG.push(`  pivotIndices: ${pivotIndices.join(", ")}`);
  // DEBUG.push(`  trigger: ${trigger}`);
  // DEBUG.push("");

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

          // DEBUG.push(`edge case check 1: ${index}`);
          // DEBUG.push(`  -> collapsible? ${collapsible}`);
          if (collapsible) {
            const prevSize = initialLayout[index];
            assert(
              prevSize != null,
              `Previous layout not found for panel index ${index}`
            );

            if (layoutNumbersEqual(prevSize, collapsedSize)) {
              const localDelta = minSize - prevSize;
              // DEBUG.push(`  -> expand delta: ${localDelta}`);

              if (compareLayoutNumbers(localDelta, Math.abs(delta)) > 0) {
                delta = delta < 0 ? 0 - localDelta : localDelta;
                // DEBUG.push(`  -> delta: ${delta}`);
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

          // DEBUG.push(`edge case check 2: ${index}`);
          // DEBUG.push(`  -> collapsible? ${collapsible}`);
          if (collapsible) {
            const prevSize = initialLayout[index];
            assert(
              prevSize != null,
              `Previous layout not found for panel index ${index}`
            );

            if (layoutNumbersEqual(prevSize, minSize)) {
              const localDelta = prevSize - collapsedSize;
              // DEBUG.push(`  -> expand delta: ${localDelta}`);

              if (compareLayoutNumbers(localDelta, Math.abs(delta)) > 0) {
                delta = delta < 0 ? 0 - localDelta : localDelta;
                // DEBUG.push(`  -> delta: ${delta}`);
              }
            }
          }
        }
        break;
      }
      // TODO Re-enable this once issues/650 is resolved
      /*
      default: {
        // If we're starting from a collapsed state, dragging past the halfway point should cause the panel to expand
        // This can happen for positive or negative drags, and panels on either side of the separator can be collapsible
        // The easiest way to support this is to detect this scenario and pre-adjust the delta before applying the rest of the layout algorithm
        // DEBUG.push(`edge case check 3: collapsible panels`);

        const index = delta < 0 ? secondPivotIndex : firstPivotIndex;
        const panelConstraints = panelConstraintsArray[index];
        assert(
          panelConstraints,
          `Panel constraints not found for index ${index}`
        );

        const { collapsible, collapsedSize, minSize } = panelConstraints;
        if (collapsible) {
          // DEBUG.push(`  -> collapsible ${isSecondPanel ? "2nd" : "1st"} panel`);
          if (delta > 0) {
            const gapSize = minSize - collapsedSize;
            const halfwayPoint = gapSize / 2;
            // DEBUG.push(`  -> halfway point: ${halfwayPoint}`);
            // DEBUG.push(`     between collapsed: ${collapsedSize}`);
            // DEBUG.push(`       and min: ${minSize}`);

            if (compareLayoutNumbers(delta, gapSize) < 0) {
              // DEBUG.push("  -> adjusting delta");
              // DEBUG.push(`       from: ${delta}`);
              delta =
                compareLayoutNumbers(delta, halfwayPoint) <= 0 ? 0 : gapSize;
              // DEBUG.push(`       to: ${delta}`);
            }
          } else {
            const gapSize = minSize - collapsedSize;
            const halfwayPoint = 100 - gapSize / 2;
            // DEBUG.push(`  -> halfway point: ${halfwayPoint}`);
            // DEBUG.push(`     between collapsed: ${100 - collapsedSize}`);
            // DEBUG.push(`       and min: ${100 - minSize}`);

            //if (isSecondPanel) {
            if (compareLayoutNumbers(Math.abs(delta), gapSize) < 0) {
              // DEBUG.push("  -> adjusting delta");
              // DEBUG.push(`       from: ${delta}`);
              delta =
                compareLayoutNumbers(100 + delta, halfwayPoint) > 0
                  ? 0
                  : -gapSize;
              // DEBUG.push(`       to: ${delta}`);
            }
          }
        }
        break;
      }
        */
    }
    // DEBUG.push("");
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

    // DEBUG.push("pre calc...");
    while (true) {
      const prevSize = initialLayout[index];
      assert(
        prevSize != null,
        `Previous layout not found for panel index ${index}`
      );

      const maxSafeSize = validatePanelSize({
        panelConstraints: panelConstraintsArray[index],
        size: 100
      });
      const delta = maxSafeSize - prevSize;
      // DEBUG.push(`  ${index}: ${prevSize} -> ${maxSafeSize}`);

      maxAvailableDelta += delta;
      index += increment;

      if (index < 0 || index >= panelConstraintsArray.length) {
        break;
      }
    }

    // DEBUG.push(`  -> max available delta: ${maxAvailableDelta}`);
    const minAbsDelta = Math.min(Math.abs(delta), Math.abs(maxAvailableDelta));
    delta = delta < 0 ? 0 - minAbsDelta : minAbsDelta;
    // DEBUG.push(`  -> adjusted delta: ${delta}`);
    // DEBUG.push("");
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
        panelConstraints: panelConstraintsArray[index],
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
  // DEBUG.push(`after 1: ${nextLayout.join(", ")}`);
  // DEBUG.push(`  deltaApplied: ${deltaApplied}`);
  // DEBUG.push("");

  // If we were unable to resize any of the panels panels, return the previous state.
  // This will essentially bailout and ignore e.g. drags past a panel's boundaries
  if (isArrayEqual(prevLayout, nextLayout)) {
    // DEBUG.push(`bailout to previous layout: ${prevLayout.join(", ")}`);
    // console.log(DEBUG.join("\n"));

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
      panelConstraints: panelConstraintsArray[pivotIndex],
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
          panelConstraints: panelConstraintsArray[index],
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
  // DEBUG.push(`after 2: ${nextLayout.join(", ")}`);
  // DEBUG.push(`  deltaApplied: ${deltaApplied}`);
  // DEBUG.push("");

  const totalSize = Object.values(nextLayout).reduce(
    (total, size) => size + total,
    0
  );
  // DEBUG.push(`total size: ${totalSize}`);

  // If our new layout doesn't add up to 100%, that means the requested delta can't be applied
  // In that case, fall back to our most recent valid layout
  // Allow for a small rounding difference, else e.g. 3 panel layouts may never be considered valid
  if (!layoutNumbersEqual(totalSize, 100, 0.1)) {
    // DEBUG.push(`bailout to previous layout: ${prevLayout.join(", ")}`);
    // console.log(DEBUG.join("\n"));

    return prevLayoutProp;
  }

  const prevLayoutKeys = Object.keys(prevLayoutProp);

  // console.log(DEBUG.join("\n"));
  return nextLayout.reduce<Layout>((accumulated, current, index) => {
    accumulated[prevLayoutKeys[index]] = current;
    return accumulated;
  }, {});
}
