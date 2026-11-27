import { copyModel } from "./copyModel";
import { createTabset } from "./createTabset";
import { findTabset } from "./findTabset";
import { insertAtDropTarget } from "./insertAtDropTarget";
import { insertAtWorkspaceEdge } from "./insertAtWorkspaceEdge";
import { insertFloatingTabset } from "./insertFloatingTabset";
import { toFloatingDropTarget } from "./toFloatingDropTarget";
import type { TabDropTarget, TabNode, WorkspaceModel } from "../types";

// Inserts a tab dropped in from another workspace (see the Workspace's dragGroup prop), like moveTab does for a tab from this workspace
export function insertTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tab: TabNode<TabData>,
  target: TabDropTarget
): WorkspaceModel<TabData, TabsetData> {
  const next = copyModel(model);
  if ("float" in target) {
    return insertFloatingTabset(next, createTabset([{ ...tab }]), target.float);
  }
  if ("edge" in target) {
    return insertAtWorkspaceEdge(next, createTabset([{ ...tab }]), target.edge);
  }

  const destination = findTabset(next, target.tabsetId);
  if (!destination) {
    return model;
  }

  return insertAtDropTarget(
    next,
    destination,
    createTabset([{ ...tab }]),
    toFloatingDropTarget(next, destination, target)
  );
}
