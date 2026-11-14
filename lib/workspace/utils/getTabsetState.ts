import { canCollapseTabset } from "../models/canCollapseTabset";
import { isTabsetCollapsed } from "./isTabsetCollapsed";
import { isTabsetDragDisabled } from "./isTabsetDragDisabled";
import type { ParentTabsetState, TabsetNode } from "../types";
import type { WorkspaceState } from "./createWorkspaceStore";

/**
 * The state of a tabset (see `useParentTabsetState`), e.g. for the functions in the Workspace's `classNames` and `styles` props.
 */
export function getTabsetState(
  {
    activeTabsetId,
    collapseOverrides,
    collapseToFit,
    disabled,
    dragGroup,
    model,
    modelIndex
  }: WorkspaceState,
  tabset: TabsetNode
): ParentTabsetState {
  const isCollapsed = isTabsetCollapsed(tabset, collapseOverrides);

  return {
    isActive: activeTabsetId === tabset.id,
    isCollapsed,
    isCollapsedToFit: isCollapsed && collapseToFit[tabset.id] === true,
    isCollapsible:
      !!tabset.collapsed ||
      modelIndex.floatingTabsetIds.has(tabset.id) ||
      canCollapseTabset(modelIndex.parentsById.get(tabset.id), tabset),
    isDragDisabled: isTabsetDragDisabled(model, tabset, disabled, dragGroup),
    isFloating: modelIndex.floatingTabsetIds.has(tabset.id),
    isMaximized: model.maximizedTabsetId === tabset.id,
    isRoot: model.root.id === tabset.id,
    selectedTabId: tabset.selectedId
  };
}
