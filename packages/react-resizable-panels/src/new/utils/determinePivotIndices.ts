import { getResizeHandle, getResizeHandlesForGroup } from "../../utils/group";

export function determinePivotIndices(
  groupId: string,
  dragHandleId: string
): [indexBefore: number, indexAfter: number] {
  const handle = getResizeHandle(dragHandleId);
  const handles = getResizeHandlesForGroup(groupId);
  const index = handle ? handles.indexOf(handle) : -1;

  return [index, index + 1];
}
