import { isTabVisible } from "./isTabVisible";
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

  return {
    isCloseDisabled: disabled || !!tab.disableClose,
    isDragDisabled: disabled || !!tab.disableDrag,
    isSelected,
    isVisible: isTabVisible(
      { model, modelIndex },
      tabset,
      tab,
      collapseOverrides
    ),
    tabsetId: tabset.id
  };
}
