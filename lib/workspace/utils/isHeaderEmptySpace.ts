// Whether a pointer target is a tabset header's empty space: the header itself or its own tab list
// (rather than a tab, the toolbar's content, or the header of a workspace rendered within it)
export function isHeaderEmptySpace(header: HTMLElement, target: Element) {
  return (
    target === header ||
    (target.hasAttribute("data-tab-list") &&
      target.closest("[data-tabset-header]") === header)
  );
}
