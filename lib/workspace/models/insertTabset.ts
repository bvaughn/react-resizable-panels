import { copyModel } from "./copyModel";
import { copyStructure } from "./copyStructure";
import { findTabset } from "./findTabset";
import { insertAtDropTarget } from "./insertAtDropTarget";
import type { TabDropTarget, TabsetNode, WorkspaceModel } from "../types";

// Inserts a tabset dropped in from another workspace (see the Workspace's dragGroup prop), like moveTabset does for a tabset from this workspace:
// edge regions insert the tabset beside the target, and other targets insert its tabs into the target
export function insertTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabset: TabsetNode<TabData, TabsetData>,
  target: TabDropTarget
): WorkspaceModel<TabData, TabsetData> {
  const next = copyModel(model);
  const destination = findTabset(next, target.tabsetId);
  if (
    !destination ||
    (("index" in target || target.region === "center") &&
      tabset.tabs.length === 0)
  ) {
    return model;
  }

  // The tabset fills the space it's given at an edge (like a tabset moved within a workspace; see moveTabset)
  const inserted = copyStructure(tabset);
  delete inserted.size;

  return insertAtDropTarget(next, destination, inserted, target);
}
