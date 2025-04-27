import { RESIZE_HANDLE_ATTRIBUTES } from "../../constants";

export function getResizeHandleElementsForGroup(
  groupId: string,
  scope: ParentNode | HTMLElement = document
): HTMLElement[] {
  return Array.from(
    scope.querySelectorAll(
      `[${RESIZE_HANDLE_ATTRIBUTES.id}][data-panel-group-id="${groupId}"]`
    )
  );
}
