// Finds a tabset's element within a workspace (rather than within a workspace nested in one of its tabs, which may use the same ids)
export function findTabsetElement(
  rootElement: HTMLElement | null,
  tabsetId: string
) {
  if (!rootElement) {
    return undefined;
  }

  return Array.from(
    rootElement.querySelectorAll<HTMLElement>("[data-tabset-id]")
  ).find(
    (element) =>
      element.dataset.tabsetId === tabsetId &&
      element.closest("[data-workspace]") === rootElement
  );
}
