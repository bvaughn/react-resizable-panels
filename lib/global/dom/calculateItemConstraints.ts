import { sizeStyleToPixels } from "../styles/sizeStyleToPixels";
import type { RegisteredResizeAxis, ResizeItemConstraints } from "../types";
import { formatLayoutNumber } from "../utils/formatLayoutNumber";
import { calculateAvailableAxisSize } from "./calculateAvailableAxisSize";

export function calculateItemConstraints(axis: RegisteredResizeAxis) {
  const { items } = axis;

  const axisSize = calculateAvailableAxisSize({ axis });
  if (axisSize === 0) {
    // Can't calculate anything meaningful if the group has a width/height of 0
    // (This could indicate that it's within a hidden subtree)
    return items.map<ResizeItemConstraints>((current) => ({
      groupResizeBehavior: current.constraintProps.groupResizeBehavior,
      collapsedSize: 0,
      collapsible: current.constraintProps.collapsible === true,
      defaultSize: undefined,
      disabled: current.constraintProps.disabled,
      minSize: 0,
      maxSize: 100,
      itemId: current.id
    }));
  }

  return items.map<ResizeItemConstraints>((item) => {
    const { element, constraintProps: itemConstraints } = item;

    let collapsedSize = 0;
    if (itemConstraints.collapsedSize !== undefined) {
      const pixels = sizeStyleToPixels({
        axisSize,
        itemElement: element,
        styleProp: itemConstraints.collapsedSize
      });

      collapsedSize = formatLayoutNumber((pixels / axisSize) * 100);
    }

    let collapsedThreshold: number | undefined = undefined;
    if (itemConstraints.collapsedThreshold !== undefined) {
      const pixels = sizeStyleToPixels({
        axisSize,
        itemElement: element,
        styleProp: itemConstraints.collapsedThreshold
      });

      collapsedThreshold = formatLayoutNumber((pixels / axisSize) * 100);
    }

    let defaultSize: number | undefined = undefined;
    if (itemConstraints.defaultSize !== undefined) {
      const pixels = sizeStyleToPixels({
        axisSize,
        itemElement: element,
        styleProp: itemConstraints.defaultSize
      });

      defaultSize = formatLayoutNumber((pixels / axisSize) * 100);
    }

    let minSize = 0;
    if (itemConstraints.minSize !== undefined) {
      const pixels = sizeStyleToPixels({
        axisSize,
        itemElement: element,
        styleProp: itemConstraints.minSize
      });

      minSize = formatLayoutNumber((pixels / axisSize) * 100);
    }

    let maxSize = 100;
    if (itemConstraints.maxSize !== undefined) {
      const pixels = sizeStyleToPixels({
        axisSize,
        itemElement: element,
        styleProp: itemConstraints.maxSize
      });

      maxSize = formatLayoutNumber((pixels / axisSize) * 100);
    }

    return {
      groupResizeBehavior: itemConstraints.groupResizeBehavior,
      collapsedSize,
      collapsedThreshold,
      collapsible: itemConstraints.collapsible === true,
      defaultSize,
      disabled: itemConstraints.disabled,
      minSize,
      maxSize,
      itemId: item.id
    };
  });
}
