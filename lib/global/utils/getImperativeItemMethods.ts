import type { PanelImperativeHandle } from "../../components/panel/types";
import { getMountedAxes, updateMountedAxis } from "../mutable-state/axes";
import { sizeStyleToPixels } from "../styles/sizeStyleToPixels";
import type {
  Layout,
  RegisteredResizeItem,
  ResizeItemConstraints
} from "../types";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { formatLayoutNumber } from "./formatLayoutNumber";
import { layoutNumbersEqual } from "./layoutNumbersEqual";
import { layoutsEqual } from "./layoutsEqual";
import { syncAxisStateToCurrentSize } from "./syncAxisStateToCurrentSize";
import { validateAxisLayout } from "./validateAxisLayout";

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
    nextSize,
    items,
    prevLayout,
    derivedItemConstraints
  }: {
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

    return adjustLayoutByDelta({
      delta: isLastItem ? prevSize - nextSize : nextSize - prevSize,
      initialLayout: prevLayout,
      itemConstraints: derivedItemConstraints,
      pivotIndices: isLastItem ? [index - 1, index] : [index, index + 1],
      prevLayout,
      trigger: "imperative-api"
    });
  };

  const setItemSize = (
    nextSize: number,
    { axis, changed, itemSize: prevSize, state }: ReturnType<typeof findSynced>
  ) => {
    if (nextSize === prevSize) {
      return;
    }

    const { derivedItemConstraints, axisSize, layout: prevLayout } = state;

    const unsafeLayout = computeLayout({
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

        setItemSize(nextSize, synced);
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
