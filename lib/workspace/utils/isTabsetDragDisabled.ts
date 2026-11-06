import type { TabsetNode, WorkspaceModel } from "../types";

// Tabsets can't be dragged:
// - When dragging is disabled (by the Workspace, the tabset, or one of its tabs, since moving the tabset would move that tab too)
// - When there's nowhere to drop them: drops are confined to a maximized tabset,
//   or the root tabset is the only tabset (unless it can be dropped into another workspace in its drag group; tabsets with the keepWhenEmpty flag can't)
export function isTabsetDragDisabled(
  model: WorkspaceModel,
  tabset: TabsetNode,
  disabled: boolean,
  dragGroup: string | undefined
) {
  return (
    disabled ||
    !!tabset.disableDrag ||
    tabset.tabs.some(({ disableDrag }) => disableDrag) ||
    (model.root.id === tabset.id &&
      (dragGroup === undefined || !!tabset.keepWhenEmpty)) ||
    model.maximizedTabsetId !== undefined
  );
}
