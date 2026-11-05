import { isRightToLeft } from "./isRightToLeft";

// Index to insert a dropped tab at, based on which tab midpoints the pointer is past
// (in a right-to-left layout, a horizontal list's tabs run from right to left)
export function getTabListIndex(
  tabList: HTMLElement,
  clientX: number,
  clientY: number
) {
  const isVertical = tabList.dataset.orientation === "vertical";
  const isReversed = !isVertical && isRightToLeft(tabList);
  const tabs = Array.from(
    tabList.querySelectorAll<HTMLElement>("[data-tab]")
  ).filter((tab) => tab.closest("[data-tab-list]") === tabList);

  const index = tabs.findIndex((tab) => {
    const rect = tab.getBoundingClientRect();
    if (isVertical) {
      return clientY < rect.top + rect.height / 2;
    }

    const midpoint = rect.left + rect.width / 2;
    return isReversed ? clientX > midpoint : clientX < midpoint;
  });

  return index === -1 ? tabs.length : index;
}
