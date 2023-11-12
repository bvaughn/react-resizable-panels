import { getResizeHandleElementIndex } from "../utils/dom/getResizeHandleElementIndex";

export function determinePivotIndices(
  groupId: string,
  dragHandleId: string
): [indexBefore: number, indexAfter: number] {
  const index = getResizeHandleElementIndex(groupId, dragHandleId);

  return index != null ? [index, index + 1] : [-1, -1];
}
