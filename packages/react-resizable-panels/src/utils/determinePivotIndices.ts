import { getResizeHandleElementIndex } from "../utils/dom/getResizeHandleElementIndex";

export function determinePivotIndices(
  groupId: string,
  dragHandleId: string,
  panelGroupElement: HTMLElement
): [indexBefore: number, indexAfter: number] {
  const index = getResizeHandleElementIndex(
    groupId,
    dragHandleId,
    panelGroupElement
  );

  return index != null ? [index, index + 1] : [-1, -1];
}
