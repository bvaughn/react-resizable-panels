import { useContext } from "react";
import { ParentTabContext } from "../contexts/ParentTabContext";
import type { ParentTabState } from "../types";
import { getTabState } from "../utils/getTabState";
import { useWorkspaceStoreSelector } from "./useWorkspaceStoreSelector";

/**
 * Returns the state of the nearest ancestor tab (or null if the component is not rendered within a tab (see `renderTab`) or the content of a tab).
 *
 * ℹ️ Components that use this hook only re-render when the tab's state changes.
 */
export function useParentTabState(): ParentTabState | null {
  const parentTab = useContext(ParentTabContext);
  const tabId = parentTab?.id;

  return useWorkspaceStoreSelector((state) => {
    const tabset =
      tabId !== undefined
        ? state.modelIndex.tabsetsByTabId.get(tabId)
        : undefined;
    const tab = tabset?.tabs.find(({ id }) => id === tabId);

    return tabset && tab ? getTabState(state, tabset, tab) : null;
  });
}
