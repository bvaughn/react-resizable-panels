import { RESIZE_HANDLE_ATTRIBUTES } from "../../constants";
import { getResizeHandleElementsForGroup } from "./getResizeHandleElementsForGroup";

export function getResizeHandleElementIndex(
  groupId: string,
  id: string,
  scope: ParentNode | HTMLElement = document
): number | null {
  const handles = getResizeHandleElementsForGroup(groupId, scope);
  const index = handles.findIndex(
    (handle) => handle.getAttribute(RESIZE_HANDLE_ATTRIBUTES.id) === id
  );
  return index ?? null;
}
