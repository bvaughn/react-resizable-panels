export function getPanelElementsForGroup(
  groupId: string,
  panelGroupElement: HTMLElement
): HTMLElement[] {
  return Array.from(
    panelGroupElement.querySelectorAll(
      `[data-panel][data-panel-group-id="${groupId}"]`
    )
  );
}
