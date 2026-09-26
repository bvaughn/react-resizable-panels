import type { PanelImperativeHandle } from "../../components/panel/types";
import { calculateAvailableAxisSize } from "../dom/calculateAvailableAxisSize";
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
    for (const [
      axis,
      {
        defaultLayoutDeferred,
        derivedItemConstraints,
        layout,
        axisSize,
        separatorToItems
      }
    ] of mountedAxes) {
      if (axis.id === axisId) {
        return {
          defaultLayoutDeferred,
          derivedItemConstraints,
          axis,
          axisSize,
          layout,
          separatorToItems
        };
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
    const prevSize = getItemSize();

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

  const setItemSize = (nextSize: number) => {
    const prevSize = getItemSize();
    if (nextSize === prevSize) {
      return;
    }

    const {
      defaultLayoutDeferred,
      derivedItemConstraints,
      axis,
      axisSize,
      layout: prevLayout,
      separatorToItems
    } = find();

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
    if (!layoutsEqual(prevLayout, nextLayout)) {
      updateMountedAxis(axis, {
        defaultLayoutDeferred,
        derivedItemConstraints,
        axisSize,
        layout: nextLayout,
        separatorToItems
      });
    }
  };

  return {
    collapse: () => {
      const { collapsible, collapsedSize } = getItemConstraints();
      const { mutableValues } = getItem();
      const size = getItemSize();

      if (collapsible && size !== collapsedSize) {
        // Store previous size in to restore if expand() is called
        mutableValues.expandToSize = size;

        setItemSize(collapsedSize);
      }
    },
    expand: () => {
      const { collapsible, collapsedSize, minSize } = getItemConstraints();
      const { mutableValues } = getItem();
      const size = getItemSize();

      if (collapsible && size === collapsedSize) {
        // Restore pre-collapse size, fallback to minSize
        let nextSize = mutableValues.expandToSize ?? minSize;

        // Edge case: if minSize is 0, pick something meaningful to expand the panel to
        if (nextSize === 0) {
          nextSize = 1;
        }

        setItemSize(nextSize);
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
      const { axis } = find();
      const { element } = getItem();
      const axisSize = calculateAvailableAxisSize({ axis });

      const asPixels = sizeStyleToPixels({
        axisSize,
        itemElement: element,
        styleProp: size
      });

      const asPercentage = formatLayoutNumber((asPixels / axisSize) * 100);

      setItemSize(asPercentage);
    }
  } satisfies PanelImperativeHandle;
}
