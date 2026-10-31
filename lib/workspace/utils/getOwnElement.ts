// Finds an element that belongs to this tabset (rather than to a tabset nested within it)
export function getOwnElement(tabsetElement: HTMLElement, selector: string) {
  return Array.from(tabsetElement.querySelectorAll<HTMLElement>(selector)).find(
    (element) => element.closest("[data-tabset-id]") === tabsetElement
  );
}
