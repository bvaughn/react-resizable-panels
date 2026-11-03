import type { TabsetNode, WorkspaceModel } from "../types";

// Tabsets can't be dragged:
// - When dragging is disabled (by the Workspace, the tabset, or one of its tabs, since moving the tabset would move that tab too)
// - When there's nowhere to drop them: the root tabset is the only tabset, and drops are confined to a maximized tabset
export function isTabsetDragDisabled(
  model: WorkspaceModel,
  tabset: TabsetNode,
  disabled: boolean
) {
  return (
    disabled ||
    !!tabset.disableDrag ||
    tabset.tabs.some(({ disableDrag }) => disableDrag) ||
    model.root.id === tabset.id ||
    model.maximizedTabsetId !== undefined
  );
}
