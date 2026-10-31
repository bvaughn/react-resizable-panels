import type { TabsetNode } from "../types";

export function removeTab(tabset: TabsetNode, tabId: string) {
  const index = tabset.tabs.findIndex(({ id }) => id === tabId);
  tabset.tabs.splice(index, 1);

  if (tabset.selectedId === tabId) {
    tabset.selectedId =
      tabset.tabs[Math.min(index, tabset.tabs.length - 1)]?.id;
  }
}
