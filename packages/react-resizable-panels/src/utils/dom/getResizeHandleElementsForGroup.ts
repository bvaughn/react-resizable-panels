import { DATA_ATTRIBUTES } from "../../constants";

export function getResizeHandleElementsForGroup(
  groupId: string,
  scope: ParentNode | HTMLElement = document
): HTMLElement[] {
  return Array.from(
    scope.querySelectorAll(
      `[${DATA_ATTRIBUTES.resizeHandleId}][data-panel-group-id="${groupId}"]`
    )
  );
}
