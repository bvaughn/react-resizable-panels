import { getOwnElement } from "./getOwnElement";

// Finds a tabset's panels within this workspace (rather than within a workspace rendered in one of its tabs)
export function findTabsetPanels(rootElement: HTMLElement, tabsetId: string) {
  const tabsetElement = Array.from(
    rootElement.querySelectorAll<HTMLElement>("[data-tabset-id]")
  ).find(
    (element) =>
      element.dataset.tabsetId === tabsetId &&
      element.closest("[data-workspace]") === rootElement
  );

  return tabsetElement
    ? getOwnElement(tabsetElement, "[data-tab-panels]")
    : undefined;
}
