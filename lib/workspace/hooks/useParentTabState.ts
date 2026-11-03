import { useContext } from "react";
import { ParentTabContext } from "../contexts/ParentTabContext";
import type { ParentTabState } from "../types";
import { isTabsetCollapsed } from "../utils/isTabsetCollapsed";
import { useWorkspaceStoreSelector } from "./useWorkspaceStoreSelector";

/**
 * Returns the state of the nearest ancestor tab (or null if the component is not rendered within a tab (see `renderTab`) or the content of a tab).
 *
 * ℹ️ Components that use this hook only re-render when the tab's state changes.
 */
export function useParentTabState(): ParentTabState | null {
  const parentTab = useContext(ParentTabContext);
  const tabId = parentTab?.id;

  return useWorkspaceStoreSelector(
    ({ collapseOverrides, disabled, model, modelIndex }) => {
      const tabset =
        tabId !== undefined ? modelIndex.tabsetsByTabId.get(tabId) : undefined;
      const tab = tabset?.tabs.find(({ id }) => id === tabId);
      if (!tabset || !tab) {
        return null;
      }

      const isSelected = tabset.selectedId === tab.id;
      const maximizedTabsetId = model.maximizedTabsetId;

      return {
        isCloseDisabled: disabled || !!tab.disableClose,
        isDragDisabled: disabled || !!tab.disableDrag,
        isSelected,
        // A maximized tabset is shown expanded, even if it's collapsed
        isVisible:
          isSelected &&
          (maximizedTabsetId === undefined
            ? !isTabsetCollapsed(tabset, collapseOverrides)
            : maximizedTabsetId === tabset.id),
        tabsetId: tabset.id
      };
    }
  );
}
