// Index to insert a dropped tab at, based on which tab midpoints the pointer is past
export function getTabListIndex(
  tabList: HTMLElement,
  clientX: number,
  clientY: number
) {
  const isVertical = tabList.dataset.orientation === "vertical";
  const tabs = Array.from(
    tabList.querySelectorAll<HTMLElement>("[data-tab]")
  ).filter((tab) => tab.closest("[data-tab-list]") === tabList);

  const index = tabs.findIndex((tab) => {
    const rect = tab.getBoundingClientRect();
    return isVertical
      ? clientY < rect.top + rect.height / 2
      : clientX < rect.left + rect.width / 2;
  });

  return index === -1 ? tabs.length : index;
}
