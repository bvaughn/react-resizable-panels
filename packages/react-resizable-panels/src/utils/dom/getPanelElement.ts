export function getPanelElement(id: string): HTMLElement | null {
  const element = document.querySelector(`[data-panel-id="${id}"]`);
  if (element) {
    return element as HTMLElement;
  }
  return null;
}
