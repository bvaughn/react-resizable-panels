import { computePercentagePanelConstraints } from "./computePercentagePanelConstraints";
import { fuzzyNumbersEqual } from "./numbers/fuzzyNumbersEqual";
import { resizePanel } from "./resizePanel";
import { PanelConstraints } from "../Panel";

let isCheckingForInfiniteLoop = false;

// All units must be in percentages; pixel values should be pre-converted
export function adjustLayoutByDelta({
  delta,
  groupSizePixels,
  layout: prevLayout,
  panelConstraints,
  pivotIndices,
  trigger,
}: {
  delta: number;
  groupSizePixels: number;
  layout: number[];
  panelConstraints: PanelConstraints[];
  pivotIndices: number[];
  trigger: "imperative-api" | "keyboard" | "mouse-or-touch";
}): number[] {
  if (fuzzyNumbersEqual(delta, 0)) {
    return prevLayout;
  }

  const nextLayout = [...prevLayout];

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
    const initialSize = nextLayout[pivotIndex]!;

    const { collapsible } = panelConstraints[pivotIndex]!;
    const { collapsedSizePercentage, minSizePercentage } =
      computePercentagePanelConstraints(
        panelConstraints,
        pivotIndex,
        groupSizePixels
      );

    const isCollapsed =
      collapsible && fuzzyNumbersEqual(initialSize, collapsedSizePercentage);

    let unsafeSize = initialSize + Math.abs(delta);
    if (isCollapsed) {
      switch (trigger) {
        case "keyboard":
          if (minSizePercentage > unsafeSize) {
            unsafeSize = minSizePercentage;
          }
      }
    }

    const safeSize = resizePanel({
      groupSizePixels,
      panelConstraints,
      panelIndex: pivotIndex,
      size: unsafeSize,
    });

    if (fuzzyNumbersEqual(initialSize, safeSize)) {
      // If there's no room for the pivot panel to grow, we should ignore this change
      return nextLayout;
    } else {
      delta = delta < 0 ? initialSize - safeSize : safeSize - initialSize;
    }
  }

  // Delta added to a panel needs to be subtracted from other panels
  // within the constraints that those panels allow
  {
    const pivotIndex = delta < 0 ? pivotIndices[0]! : pivotIndices[1]!;
    let index = pivotIndex;
    while (index >= 0 && index < panelConstraints.length) {
      const deltaRemaining = Math.abs(delta) - Math.abs(deltaApplied);

      const prevSize = prevLayout[index]!;
      const unsafeSize = prevSize - deltaRemaining;

      let safeSize = resizePanel({
        groupSizePixels,
        panelConstraints,
        panelIndex: index,
        size: unsafeSize,
      });

      if (!fuzzyNumbersEqual(prevSize, safeSize)) {
        deltaApplied += prevSize - safeSize;

        nextLayout[index] = safeSize;

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
  if (fuzzyNumbersEqual(deltaApplied, 0)) {
    return prevLayout;
  }

  {
    const pivotIndex = delta < 0 ? pivotIndices[1]! : pivotIndices[0]!;

    const unsafeSize = prevLayout[pivotIndex]! + deltaApplied;
    const safeSize = resizePanel({
      groupSizePixels,
      panelConstraints,
      panelIndex: pivotIndex,
      size: unsafeSize,
    });

    // Adjust the pivot panel before, but only by the amount that surrounding panels were able to shrink/contract.
    nextLayout[pivotIndex] = safeSize;

    // Edge case where expanding or contracting one panel caused another one to change collapsed state
    if (!fuzzyNumbersEqual(safeSize, unsafeSize)) {
      let deltaRemaining = unsafeSize - safeSize;

      const pivotIndex = delta < 0 ? pivotIndices[1]! : pivotIndices[0]!;
      let index = pivotIndex;
      while (index >= 0 && index < panelConstraints.length) {
        const prevSize = nextLayout[index]!;
        const unsafeSize = prevSize + deltaRemaining;
        const safeSize = resizePanel({
          groupSizePixels,
          panelConstraints,
          panelIndex: index,
          size: unsafeSize,
        });

        if (!fuzzyNumbersEqual(prevSize, safeSize)) {
          deltaRemaining -= safeSize - prevSize;

          nextLayout[index] = safeSize;
        }

        if (fuzzyNumbersEqual(deltaRemaining, 0)) {
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
      if (!fuzzyNumbersEqual(deltaRemaining, 0)) {
        let didSetInfiniteLoopCheckCounter = false;
        if (isCheckingForInfiniteLoop === null) {
          didSetInfiniteLoopCheckCounter = true;
          isCheckingForInfiniteLoop = true;
        }

        try {
          return adjustLayoutByDelta({
            delta: delta < 0 ? delta + 1 : delta - 1,
            groupSizePixels,
            layout: prevLayout,
            panelConstraints,
            pivotIndices,
            trigger,
          });
        } catch (error) {
          if (error instanceof RangeError) {
            console.error(`Could not apply delta ${delta} to layout`);

            return prevLayout;
          }
        } finally {
          if (didSetInfiniteLoopCheckCounter) {
            isCheckingForInfiniteLoop = false;
          }
        }
      }
    }
  }

  return nextLayout;
}
