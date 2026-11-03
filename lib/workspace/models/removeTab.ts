import { getReplacementTabId } from "./getReplacementTabId";
import type { TabsetNode } from "../types";

export function removeTab(tabset: TabsetNode, tabId: string) {
  const index = tabset.tabs.findIndex(({ id }) => id === tabId);
  if (index < 0) {
    return;
  }

  if (tabset.selectedId === tabId) {
    tabset.selectedId = getReplacementTabId(tabset, tabId);
  }

  tabset.tabs.splice(index, 1);
}
