import { isTabsetCollapsed } from "./isTabsetCollapsed";
import type { ParentTabState, TabNode, TabsetNode } from "../types";
import type { WorkspaceState } from "./createWorkspaceStore";

/**
 * The state of a tab within its tabset (see `useParentTabState`), e.g. for the functions in the Workspace's `classNames` and `styles` props.
 */
export function getTabState(
  { collapseOverrides, disabled, model, modelIndex }: WorkspaceState,
  tabset: TabsetNode,
  tab: TabNode
): ParentTabState {
  const isSelected = tabset.selectedId === tab.id;
  const maximizedTabsetId = model.maximizedTabsetId;

  return {
    isCloseDisabled: disabled || !!tab.disableClose,
    isDragDisabled: disabled || !!tab.disableDrag,
    isSelected,
    // A maximized tabset is shown expanded, even if it's collapsed;
    // floating tabsets are shown above it, so they're only hidden if they're collapsed
    isVisible:
      isSelected &&
      (maximizedTabsetId === undefined ||
      modelIndex.floatingTabsetIds.has(tabset.id)
        ? !isTabsetCollapsed(tabset, collapseOverrides)
        : maximizedTabsetId === tabset.id),
    tabsetId: tabset.id
  };
}
