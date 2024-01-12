export function getPanelElementsForGroup(
  groupId: string,
  panelGroupElement: ParentNode | HTMLElement = document
): HTMLElement[] {
  return Array.from(
    panelGroupElement.querySelectorAll(
      `[data-panel][data-panel-group-id="${groupId}"]`
    )
  );
}
