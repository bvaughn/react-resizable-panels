export function getPanelElementsForGroup(groupId: string): HTMLDivElement[] {
  return Array.from(
    document.querySelectorAll(`[data-panel][data-panel-group-id="${groupId}"]`)
  );
}
