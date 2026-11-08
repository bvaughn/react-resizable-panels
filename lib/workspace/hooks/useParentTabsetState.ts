import { useContext } from "react";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import type { ParentTabsetState } from "../types";
import { canCollapseTabset } from "../models/canCollapseTabset";
import { isTabsetCollapsed } from "../utils/isTabsetCollapsed";
import { isTabsetDragDisabled } from "../utils/isTabsetDragDisabled";
import { useWorkspaceStoreSelector } from "./useWorkspaceStoreSelector";

/**
 * Returns the state of the nearest ancestor tabset (or null if the component is not rendered within a tabset or the content of a tab).
 *
 * ℹ️ Components that use this hook only re-render when the tabset's state changes.
 */
export function useParentTabsetState(): ParentTabsetState | null {
  const parentTabset = useContext(ParentTabsetContext);
  const tabsetId = parentTabset?.id;

  return useWorkspaceStoreSelector(
    ({
      activeTabsetId,
      collapseOverrides,
      collapseToFit,
      disabled,
      dragGroup,
      model,
      modelIndex
    }) => {
      const tabset =
        tabsetId !== undefined
          ? modelIndex.tabsetsById.get(tabsetId)
          : undefined;
      if (!tabset) {
        return null;
      }

      return {
        isActive: activeTabsetId === tabset.id,
        isCollapsed: isTabsetCollapsed(tabset, collapseOverrides),
        isCollapsedToFit:
          isTabsetCollapsed(tabset, collapseOverrides) &&
          collapseToFit[tabset.id] === true,
        isCollapsible:
          !!tabset.collapsed ||
          modelIndex.floatingTabsetIds.has(tabset.id) ||
          canCollapseTabset(modelIndex.parentsById.get(tabset.id), tabset),
        isDragDisabled: isTabsetDragDisabled(
          model,
          tabset,
          disabled,
          dragGroup
        ),
        isFloating: modelIndex.floatingTabsetIds.has(tabset.id),
        isMaximized: model.maximizedTabsetId === tabset.id,
        isRoot: model.root.id === tabset.id,
        selectedTabId: tabset.selectedId
      };
    }
  );
}
