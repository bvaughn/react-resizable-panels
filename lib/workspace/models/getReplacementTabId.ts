import type { TabsetNode } from "../types";

// The tab to select when a tabset's selected tab is removed:
// its most recently selected other tab (if the tabset tracks them, see updateRecentTabIds),
// otherwise the tab after it (or before it, if it's the last tab)
export function getReplacementTabId(tabset: TabsetNode, tabId: string) {
  const recentTabId = tabset.recentTabIds?.find(
    (id) => id !== tabId && tabset.tabs.some((tab) => tab.id === id)
  );
  if (recentTabId !== undefined) {
    return recentTabId;
  }

  const index = tabset.tabs.findIndex(({ id }) => id === tabId);

  return (tabset.tabs[index + 1] ?? tabset.tabs[index - 1])?.id;
}
