import { getResizeHandleElementsForGroup } from "./getResizeHandleElementsForGroup";

export function getResizeHandleElementIndex(
  groupId: string,
  id: string
): number | null {
  const handles = getResizeHandleElementsForGroup(groupId);
  const index = handles.findIndex(
    (handle) => handle.getAttribute("data-panel-resize-handle-id") === id
  );
  return index ?? null;
}
