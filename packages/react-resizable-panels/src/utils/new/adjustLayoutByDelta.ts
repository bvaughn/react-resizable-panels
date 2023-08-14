import { computePercentagePanelConstraints } from "./computePercentagePanelConstraints";
import { fuzzyCompareNumbers } from "./fuzzyCompareNumbers";
import { resizePanel } from "./resizePanel";
import { PanelConstraints } from "./types";

// All units must be in percentages; pixel values should be pre-converted
export function adjustLayoutByDelta({
  delta,
  groupSizePixels,
  layout,
  panelConstraints,
  pivotIndices,
}: {
  delta: number;
  groupSizePixels: number;
  layout: number[];
  panelConstraints: PanelConstraints[];
  // TODO panelExpandToSizes: number[]
  pivotIndices: number[];
}): number[] {
  if (delta === 0) {
    return layout;
  }

  let deltaApplied = 0;

  // A resizing panel affects the panels before or after it.
  //
  // A negative delta means the panel immediately after the resizer should grow/expand by decreasing its offset.
  // Other panels may also need to shrink/contract (and shift) to make room, depending on the min weights.
  //
  // A positive delta means the panel immediately before the resizer should "expand".
  // This is accomplished by shrinking/contracting (and shifting) one or more of the panels after the resizer.

  // First, check the panel we're pivoting around;
  // We should only expand or contract by as much as its constraints allow
  {
    const pivotIndex = delta < 0 ? pivotIndices[1]! : pivotIndices[0]!;
    const initialSize = layout[pivotIndex]!;

    const { collapsible } = panelConstraints[pivotIndex]!;
    const { collapsedSizePercentage, minSizePercentage } =
      computePercentagePanelConstraints(
        panelConstraints,
        pivotIndex,
        groupSizePixels
      );
    const isCollapsed = collapsible && initialSize === collapsedSizePercentage;

    // TODO Could this, combined with the recursion, cause an infinite loop?
    const unsafeSize = isCollapsed
      ? minSizePercentage
      : initialSize + Math.abs(delta);
    const safeSize = resizePanel({
      groupSizePixels,
      panelConstraints,
      panelIndex: pivotIndex,
      size: unsafeSize,
    });

    if (initialSize === safeSize) {
      // If there's no room for the pivot panel to grow, we should ignore this change
      return layout;
    } else {
      delta = delta < 0 ? initialSize - safeSize : safeSize - initialSize;
    }
  }

  const initialLayout = [...layout];

  // Delta added to a panel needs to be subtracted from other panels
  // within the constraints that those panels allow
  {
    const pivotIndex = delta < 0 ? pivotIndices[0]! : pivotIndices[1]!;
    let index = pivotIndex;
    while (index >= 0 && index < panelConstraints.length) {
      const deltaRemaining = Math.abs(delta) - Math.abs(deltaApplied);

      const baseSize = initialLayout[index]!;
      const unsafeSize = baseSize - deltaRemaining;

      let safeSize = resizePanel({
        groupSizePixels,
        panelConstraints,
        panelIndex: index,
        size: unsafeSize,
      });

      if (baseSize !== safeSize) {
        deltaApplied += baseSize - safeSize;

        layout[index] = safeSize;

        if (
          deltaApplied
            .toPrecision(3)
            .localeCompare(Math.abs(delta).toPrecision(3), undefined, {
              numeric: true,
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
  if (fuzzyCompareNumbers(deltaApplied, 0)) {
    return initialLayout;
  }

  {
    const pivotIndex = delta < 0 ? pivotIndices[1]! : pivotIndices[0]!;

    const unsafeSize = initialLayout[pivotIndex]! + deltaApplied;
    const safeSize = resizePanel({
      groupSizePixels,
      panelConstraints,
      panelIndex: pivotIndex,
      size: unsafeSize,
    });

    // Adjust the pivot panel before, but only by the amount that surrounding panels were able to shrink/contract.
    layout[pivotIndex] = safeSize;

    // Edge case where expanding or contracting one panel caused another one to change collapsed state
    if (safeSize !== unsafeSize) {
      let deltaRemaining = unsafeSize - safeSize;

      const pivotIndex = delta < 0 ? pivotIndices[1]! : pivotIndices[0]!;
      let index = pivotIndex;
      while (index >= 0 && index < panelConstraints.length) {
        const baseSize = layout[index]!;
        const unsafeSize = baseSize + deltaRemaining;
        const safeSize = resizePanel({
          groupSizePixels,
          panelConstraints,
          panelIndex: index,
          size: unsafeSize,
        });

        if (baseSize !== safeSize) {
          deltaRemaining -= safeSize - baseSize;

          layout[index] = safeSize;
        }

        if (fuzzyCompareNumbers(deltaRemaining, 0)) {
          break;
        }

        if (delta > 0) {
          index--;
        } else {
          index++;
        }
      }

      // If we can't redistribute, this layout is invalid;
      // There may be an incremental layout that is valid though
      if (!fuzzyCompareNumbers(deltaRemaining, 0)) {
        return adjustLayoutByDelta({
          delta: delta < 0 ? delta + 1 : delta - 1,
          groupSizePixels,
          layout: initialLayout,
          panelConstraints,
          pivotIndices,
        });
      }
    }
  }

  return layout;
}
