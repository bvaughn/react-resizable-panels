import { getModelIndex } from "../models/getModelIndex";
import type { TabsetNode, WorkspaceModel } from "../types";

// Tabsets can't be dragged:
// - When dragging is disabled (by the Workspace, the tabset, or one of its tabs, since moving the tabset would move that tab too)
// - When there's nowhere to drop them: drops are confined to a maximized tabset (and floating tabsets),
//   or the root tabset is the only tabset (unless it can be dropped into another workspace in its drag group; tabsets with the keepWhenEmpty flag can't)
//
// Dragging a floating tabset moves (or resizes) it instead (see WorkspaceModel.floating), so only the Workspace and its own flag prevent that
// (it doesn't move its tabs elsewhere, and can be moved while another tabset is maximized)
export function isTabsetDragDisabled(
  model: WorkspaceModel,
  tabset: TabsetNode,
  disabled: boolean,
  dragGroup: string | undefined
) {
  if (getModelIndex(model).floatingTabsetIds.has(tabset.id)) {
    return disabled || !!tabset.disableDrag;
  }

  return (
    disabled ||
    !!tabset.disableDrag ||
    tabset.tabs.some(({ disableDrag }) => disableDrag) ||
    (model.root.id === tabset.id &&
      (dragGroup === undefined || !!tabset.keepWhenEmpty)) ||
    model.maximizedTabsetId !== undefined
  );
}
