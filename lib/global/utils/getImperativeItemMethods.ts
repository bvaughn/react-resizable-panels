import type { PanelImperativeHandle } from "../../flex/types";
import { getMountedAxes, updateMountedAxis } from "../mutable-state/axes";
import { sizeStyleToPixels } from "../styles/sizeStyleToPixels";
import type {
  Layout,
  RegisteredResizeItem,
  ResizeItemConstraints
} from "../types";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { compareLayoutNumbers } from "./compareLayoutNumbers";
import { formatLayoutNumber } from "./formatLayoutNumber";
import { layoutNumbersEqual } from "./layoutNumbersEqual";
import { layoutsEqual } from "./layoutsEqual";
import { syncAxisStateToCurrentSize } from "./syncAxisStateToCurrentSize";
import { validateAxisLayout } from "./validateAxisLayout";
import { validateItemSize } from "./validateItemSize";

export function getImperativeItemMethods({
  axisId,
  itemId
}: {
  axisId: string;
  itemId: string;
}): PanelImperativeHandle {
  const find = () => {
    const mountedAxes = getMountedAxes();
    for (const [axis, value] of mountedAxes) {
      if (axis.id === axisId) {
        return { axis, ...value };
      }
    }

    throw Error(`Group ${axisId} not found`);
  };

  const getItemConstraints = () => {
    const match = find().derivedItemConstraints.find(
      (current) => current.itemId === itemId
    );
    if (match !== undefined) {
      return match;
    }

    throw Error(`Panel constraints not found for Panel ${itemId}`);
  };

  // The axis may have been resized since its ResizeObserver last ran,
  // in which case its pixel based constraints (and layout) are stale (see #770)
  const findSynced = () => {
    const { axis, ...axisState } = find();
    const synced = syncAxisStateToCurrentSize({ axis, axisState });
    const state = synced?.state ?? axisState;

    const itemConstraints = state.derivedItemConstraints.find(
      (current) => current.itemId === itemId
    );
    if (itemConstraints === undefined) {
      throw Error(`Panel constraints not found for Panel ${itemId}`);
    }

    const itemSize = state.layout[itemId];
    if (itemSize === undefined) {
      throw Error(`Layout not found for Panel ${itemId}`);
    }

    return {
      axis,
      changed: synced?.changed === true,
      itemConstraints,
      itemSize,
      state
    };
  };

  const getItem = () => {
    const match = find().axis.items.find((current) => current.id === itemId);
    if (match !== undefined) {
      return match;
    }

    throw Error(`Layout not found for Panel ${itemId}`);
  };

  const getItemSize = () => {
    const match = find().layout[itemId];
    if (match !== undefined) {
      return match;
    }

    throw Error(`Layout not found for Panel ${itemId}`);
  };

  /**
   * Compute the next (unvalidated) layout when resizing a panel imperatively.
   *
   * Handles two edge cases for the last panel:
   * 1. Single panel in the axis — no sibling exists to form valid pivot indices.
   * 2. All preceding panels are already collapsed — the normal reversed-delta
   *    logic would cascade the freed space to the first panel. Instead the last
   *    panel keeps the remainder so it stays the largest.
   */
  const computeLayout = ({
    allowPartialSize = false,
    nextSize,
    items,
    prevLayout,
    derivedItemConstraints
  }: {
    allowPartialSize?: boolean;
    nextSize: number;
    items: RegisteredResizeItem[];
    prevLayout: Layout;
    derivedItemConstraints: ResizeItemConstraints[];
  }): Layout => {
    const prevSize = prevLayout[itemId];

    const index = items.findIndex((current) => current.id === itemId);
    const isFirstItem = index === 0;
    const isLastItem = index === items.length - 1;

    const allPreviousCollapsed =
      isLastItem &&
      nextSize < prevSize &&
      (isFirstItem ||
        items.slice(0, index).every((_item, itemIndex) => {
          const pc = derivedItemConstraints[itemIndex];
          return (
            pc?.collapsible &&
            layoutNumbersEqual(pc.collapsedSize, prevLayout[pc.itemId])
          );
        }));

    if (allPreviousCollapsed) {
      const occupiedByPrevious = items
        .slice(0, index)
        .reduce((total, item) => total + prevLayout[item.id], 0);
      return {
        ...prevLayout,
        [itemId]: formatLayoutNumber(100 - occupiedByPrevious)
      };
    }

    // First try to make the change without collapsing or expanding any other panel:
    // take space from (or give it to) the nearest panels that can absorb it, never past their min (or max) size,
    // starting with the panels after this one
    const itemConstraints = derivedItemConstraints[index];
    const targetSize = validateItemSize({
      overrideDisabledItems: true,
      itemConstraints,
      prevSize,
      size: nextSize
    });
    const fittedLayout = { ...prevLayout };
    let remainingDelta = targetSize - prevSize;
    for (const step of isFirstItem ? [1] : isLastItem ? [-1] : [1, -1]) {
      for (
        let current = index + step;
        current >= 0 &&
        current < items.length &&
        !layoutNumbersEqual(remainingDelta, 0);
        current += step
      ) {
        const constraints = derivedItemConstraints[current];
        const size = fittedLayout[constraints.itemId];
        if (
          isItemCollapsed(constraints, fittedLayout) ||
          (remainingDelta > 0
            ? compareLayoutNumbers(size, constraints.minSize) <= 0
            : compareLayoutNumbers(size, constraints.maxSize) >= 0)
        ) {
          continue;
        }

        const nextOtherSize =
          remainingDelta > 0
            ? Math.max(constraints.minSize, size - remainingDelta)
            : Math.min(constraints.maxSize, size - remainingDelta);
        remainingDelta -= size - nextOtherSize;
        fittedLayout[constraints.itemId] = formatLayoutNumber(nextOtherSize);
      }
    }
    fittedLayout[itemId] = formatLayoutNumber(targetSize - remainingDelta);

    if (
      layoutNumbersEqual(remainingDelta, 0) ||
      (allowPartialSize &&
        compareLayoutNumbers(fittedLayout[itemId], itemConstraints.minSize) >=
          0)
    ) {
      return fittedLayout;
    }

    // Otherwise fall back to a change that may collapse or expand other panels

    // Grow (or shrink) this panel by taking space from (or giving it to) the panels after it,
    // or the panels before it, cascading away from this panel
    const adjustAgainst = (
      side: "after" | "before",
      layout: Layout,
      sizeDelta: number
    ) => {
      // Pair this panel with the nearest panel on that side that can absorb the change:
      // one that isn't collapsed (collapsed panels can't give up space and shouldn't be expanded by it)
      // and isn't already at its min size (when taking space) or max size (when giving space).
      // Otherwise fall back to the nearest panel that isn't collapsed, or the adjacent panel.
      const step = side === "after" ? 1 : -1;
      const findPartnerIndex = (
        predicate: (constraints: ResizeItemConstraints) => boolean
      ) => {
        for (
          let current = index + step;
          current >= 0 && current < items.length;
          current += step
        ) {
          const constraints = derivedItemConstraints[current];
          if (!isItemCollapsed(constraints, layout) && predicate(constraints)) {
            return current;
          }
        }
      };
      const partnerIndex =
        findPartnerIndex(({ itemId: otherItemId, maxSize, minSize }) =>
          sizeDelta > 0
            ? compareLayoutNumbers(layout[otherItemId], minSize) > 0
            : compareLayoutNumbers(layout[otherItemId], maxSize) < 0
        ) ??
        findPartnerIndex(() => true) ??
        index + step;

      return adjustLayoutByDelta({
        delta: side === "after" ? sizeDelta : -sizeDelta,
        initialLayout: layout,
        itemConstraints: derivedItemConstraints,
        pivotIndices:
          side === "after" ? [index, partnerIndex] : [partnerIndex, index],
        prevLayout: layout,
        trigger: "imperative-api"
      });
    };

    if (isFirstItem || isLastItem) {
      return adjustAgainst(
        isLastItem ? "before" : "after",
        prevLayout,
        nextSize - prevSize
      );
    }

    // Panels in the middle can use space from either side;
    // if the first side can't make up the full difference (e.g. its panels are collapsed or at their min size),
    // the remainder comes from the other side
    const adjustAgainstBothSides = (first: "after" | "before") => {
      const layout = adjustAgainst(first, prevLayout, nextSize - prevSize);
      const remainingDelta = nextSize - layout[itemId];

      return layoutNumbersEqual(remainingDelta, 0)
        ? layout
        : adjustAgainst(
            first === "after" ? "before" : "after",
            layout,
            remainingDelta
          );
    };

    // Prefer the panels after this one, unless that would collapse or expand one of them and the other side wouldn't
    const layout = adjustAgainstBothSides("after");
    if (
      changesOtherCollapsedState({
        itemConstraints: derivedItemConstraints,
        itemId,
        nextLayout: layout,
        prevLayout
      })
    ) {
      const alternateLayout = adjustAgainstBothSides("before");
      if (
        !changesOtherCollapsedState({
          itemConstraints: derivedItemConstraints,
          itemId,
          nextLayout: alternateLayout,
          prevLayout
        })
      ) {
        return alternateLayout;
      }
    }

    return layout;
  };

  const setItemSize = (
    nextSize: number,
    { axis, changed, itemSize: prevSize, state }: ReturnType<typeof findSynced>,
    { allowPartialSize = false }: { allowPartialSize?: boolean } = {}
  ) => {
    if (nextSize === prevSize) {
      return;
    }

    const { derivedItemConstraints, axisSize, layout: prevLayout } = state;

    const unsafeLayout = computeLayout({
      allowPartialSize,
      nextSize,
      items: axis.items,
      prevLayout,
      derivedItemConstraints
    });

    const nextLayout = validateAxisLayout({
      layout: unsafeLayout,
      itemConstraints: derivedItemConstraints
    });
    if (changed || !layoutsEqual(prevLayout, nextLayout)) {
      updateMountedAxis(axis, {
        ...state,
        layout: nextLayout,
        requestedAxisSize: axisSize,
        requestedLayout: nextLayout
      });
    }
  };

  return {
    collapse: () => {
      const synced = findSynced();
      const { collapsible, collapsedSize } = synced.itemConstraints;
      const { mutableValues } = getItem();
      const size = synced.itemSize;

      if (collapsible && size !== collapsedSize) {
        // Store previous size in order to restore it if expand() is called
        mutableValues.expandToSize = size;

        setItemSize(collapsedSize, synced);
      }
    },
    expand: () => {
      const synced = findSynced();
      const { collapsible, collapsedSize, minSize } = synced.itemConstraints;
      const { mutableValues } = getItem();
      const size = synced.itemSize;

      if (collapsible && size === collapsedSize) {
        // Restore pre-collapse size, fallback to minSize
        let nextSize = mutableValues.expandToSize ?? minSize;

        // Edge case: if minSize is 0, pick something meaningful to expand the panel to
        if (nextSize === 0) {
          nextSize = 1;
        }

        // If restoring the pre-collapse size would require collapsing another panel,
        // expand to the largest size that fits (as long as it's at least the min size)
        setItemSize(nextSize, synced, { allowPartialSize: true });
      }
    },
    getSize: () => {
      const { axis } = find();
      const asPercentage = getItemSize();
      const { element } = getItem();

      const inPixels = axis.layoutStrategy
        ? axis.layoutStrategy.getItemSizeInPixels(itemId)
        : axis.orientation === "horizontal"
          ? element.offsetWidth
          : element.offsetHeight;

      return {
        asPercentage,
        inPixels
      };
    },
    isCollapsed: () => {
      const { collapsible, collapsedSize } = getItemConstraints();
      const size = getItemSize();

      return collapsible && layoutNumbersEqual(collapsedSize, size);
    },
    resize: (size: number | string) => {
      const synced = findSynced();
      const { axisSize } = synced.state;
      const { element } = getItem();

      const asPixels = sizeStyleToPixels({
        axisSize,
        itemElement: element,
        styleProp: size
      });

      const asPercentage = formatLayoutNumber((asPixels / axisSize) * 100);

      setItemSize(asPercentage, synced);
    }
  } satisfies PanelImperativeHandle;
}

function isItemCollapsed(
  { collapsedSize, collapsible, itemId }: ResizeItemConstraints,
  layout: Layout
) {
  return collapsible && layoutNumbersEqual(layout[itemId], collapsedSize);
}

// Whether a layout change collapses or expands a panel other than the one being resized
function changesOtherCollapsedState({
  itemConstraints,
  itemId,
  nextLayout,
  prevLayout
}: {
  itemConstraints: ResizeItemConstraints[];
  itemId: string;
  nextLayout: Layout;
  prevLayout: Layout;
}) {
  return itemConstraints.some(
    (constraints) =>
      constraints.itemId !== itemId &&
      isItemCollapsed(constraints, prevLayout) !==
        isItemCollapsed(constraints, nextLayout)
  );
}
