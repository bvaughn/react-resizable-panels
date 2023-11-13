export function getPanelGroupElement(id: string): HTMLDivElement | null {
  const element = document.querySelector(
    `[data-panel-group][data-panel-group-id="${id}"]`
  );
  if (element) {
    return element as HTMLDivElement;
  }
  return null;
}
