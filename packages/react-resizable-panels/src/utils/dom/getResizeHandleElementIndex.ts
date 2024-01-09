import { getResizeHandleElementsForGroup } from "./getResizeHandleElementsForGroup";

export function getResizeHandleElementIndex(
  groupId: string,
  id: string,
  panelGroupElement: ParentNode
): number | null {
  const handles = getResizeHandleElementsForGroup(groupId, panelGroupElement);
  const index = handles.findIndex(
    (handle) => handle.getAttribute("data-panel-resize-handle-id") === id
  );
  return index ?? null;
}
