export function getPanelElementsForGroup(groupId: string): HTMLElement[] {
  return Array.from(
    document.querySelectorAll(`[data-panel][data-panel-group-id="${groupId}"]`)
  );
}
