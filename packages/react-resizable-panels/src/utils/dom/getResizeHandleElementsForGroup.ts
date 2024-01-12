export function getResizeHandleElementsForGroup(
  groupId: string,
  panelGroupElement: ParentNode | HTMLElement = document
): HTMLElement[] {
  return Array.from(
    panelGroupElement.querySelectorAll(
      `[data-panel-resize-handle-id][data-panel-group-id="${groupId}"]`
    )
  );
}
