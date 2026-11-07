import { copyModel } from "./copyModel";
import { detachFloatingTabset } from "./detachFloatingTabset";
import { findParent } from "./findParent";
import { findTabset } from "./findTabset";
import { insertAtDropTarget } from "./insertAtDropTarget";
import { insertAtWorkspaceEdge } from "./insertAtWorkspaceEdge";
import { isAtWorkspaceEdge } from "./isAtWorkspaceEdge";
import { toFloatingDropTarget } from "./toFloatingDropTarget";
import type { TabDropTarget, TabsetNode, WorkspaceModel } from "../types";

// Edge regions (and edges of the workspace) move the tabset beside the target (docking a floating tabset in the layout);
// other targets move its tabs into the target (and the emptied tabset is removed, unless it's kept when empty)
export function moveTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string,
  target: TabDropTarget
): WorkspaceModel<TabData, TabsetData> {
  const next = copyModel(model);
  const source = findTabset(next, tabsetId);
  if (!source) {
    return model;
  }

  if ("edge" in target) {
    const docked = detachFloatingTabset(next, source);
    if (docked) {
      return insertAtWorkspaceEdge(next, docked, target.edge);
    }

    // The root tabset is already at every edge
    const parent = findParent(next.root, source.id);
    if (!parent || isAtWorkspaceEdge(next.root, source, target.edge)) {
      return model;
    }

    // Siblings share the space the tabset leaves (see normalizeModel)
    parent.children.splice(parent.children.indexOf(source), 1);

    return insertAtWorkspaceEdge(next, source, target.edge);
  }

  const destination = findTabset(next, target.tabsetId);
  if (!destination || source === destination) {
    return model;
  }

  // Floating tabsets can't be split
  const tabsetTarget = toFloatingDropTarget(next, destination, target);

  let inserted: TabsetNode<TabData, TabsetData>;
  if ("index" in tabsetTarget || tabsetTarget.region === "center") {
    if (source.tabs.length === 0) {
      return model;
    }

    // The source is emptied, so that normalizing the model removes it (unless it's kept when empty)
    inserted = { ...source };
    source.tabs = [];
    source.selectedId = undefined;
  } else {
    const docked = detachFloatingTabset(next, source);
    if (docked) {
      inserted = docked;
    } else {
      // The source can't be the root, since the destination is another tabset
      const parent = findParent(next.root, source.id);
      if (!parent) {
        return model;
      }

      // Siblings share the space the tabset leaves (see normalizeModel)
      parent.children.splice(parent.children.indexOf(source), 1);
      inserted = source;
    }
  }

  return insertAtDropTarget(next, destination, inserted, tabsetTarget);
}
