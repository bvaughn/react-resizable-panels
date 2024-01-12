export function getPanelElement(
  id: string,
  panelGroupElement: ParentNode | HTMLElement = document
): HTMLElement | null {
  const element = panelGroupElement.querySelector(`[data-panel-id="${id}"]`);
  if (element) {
    return element as HTMLElement;
  }
  return null;
}
