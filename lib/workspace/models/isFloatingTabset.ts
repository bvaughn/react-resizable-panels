import type { FloatingTabsetNode, TabsetNode, WorkspaceModel } from "../types";

export function isFloatingTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabset: TabsetNode<TabData, TabsetData>
): tabset is TabsetNode<TabData, TabsetData> &
  FloatingTabsetNode<TabData, TabsetData> {
  return !!model.floating?.includes(
    tabset as FloatingTabsetNode<TabData, TabsetData>
  );
}
