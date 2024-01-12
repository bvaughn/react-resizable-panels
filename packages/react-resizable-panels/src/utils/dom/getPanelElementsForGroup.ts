export function getPanelElementsForGroup(
  groupId: string,
  scope: ParentNode | HTMLElement = document
): HTMLElement[] {
  return Array.from(
    scope.querySelectorAll(`[data-panel][data-panel-group-id="${groupId}"]`)
  );
}
