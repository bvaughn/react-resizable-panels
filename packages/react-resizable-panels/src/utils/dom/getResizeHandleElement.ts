export function getResizeHandleElement(
  id: string,
  panelGroupElement: ParentNode
): HTMLElement | null {
  const element = panelGroupElement.querySelector(
    `[data-panel-resize-handle-id="${id}"]`
  );
  if (element) {
    return element as HTMLElement;
  }
  return null;
}
