export function getPanelGroupElement(id: string): HTMLElement | null {
  const element = document.querySelector(
    `[data-panel-group][data-panel-group-id="${id}"]`
  );
  if (element) {
    return element as HTMLElement;
  }
  return null;
}
