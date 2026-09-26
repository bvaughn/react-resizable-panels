import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { validateAxisLayout } from "./validateAxisLayout";
import type { Layout, ResizeItemConstraints } from "../types";

export function calculateSeparatorAriaValues({
  layout,
  itemConstraints,
  itemId,
  itemIndex
}: {
  layout: Layout;
  itemConstraints: ResizeItemConstraints[];
  itemId: string;
  itemIndex: number;
}): {
  valueControls: string | undefined;
  valueMax: number | undefined;
  valueMin: number | undefined;
  valueNow: number | undefined;
} {
  let valueMax: number | undefined = undefined;
  let valueMin: number | undefined = undefined;

  const itemSize = layout[itemId];

  const constraints = itemConstraints.find(
    (current) => current.itemId === itemId
  );
  if (constraints) {
    const maxSize = constraints.maxSize;
    const minSize = constraints.collapsible
      ? constraints.collapsedSize
      : constraints.minSize;

    const pivotIndices = [itemIndex, itemIndex + 1];

    const minSizeLayout = validateAxisLayout({
      layout: adjustLayoutByDelta({
        delta: minSize - itemSize,
        initialLayout: layout,
        itemConstraints,
        pivotIndices,
        prevLayout: layout
      }),
      itemConstraints
    });

    valueMin = minSizeLayout[itemId];

    const maxSizeLayout = validateAxisLayout({
      layout: adjustLayoutByDelta({
        delta: maxSize - itemSize,
        initialLayout: layout,
        itemConstraints,
        pivotIndices,
        prevLayout: layout
      }),
      itemConstraints
    });

    valueMax = maxSizeLayout[itemId];
  }

  return {
    valueControls: itemId,
    valueMax,
    valueMin,
    valueNow: itemSize
  };
}
