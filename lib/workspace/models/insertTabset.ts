import { copyModel } from "./copyModel";
import { copyStructure } from "./copyStructure";
import { expandTabset } from "./expandTabset";
import { findTabset } from "./findTabset";
import { normalizeModel } from "./normalizeModel";
import { splitTabset } from "./splitTabset";
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
  if (!destination) {
    return model;
  }

  const inserted = copyStructure(tabset);

  if ("index" in target || target.region === "center") {
    if (inserted.tabs.length === 0) {
      return model;
    }

    const index =
      "index" in target
        ? Math.max(0, Math.min(target.index, destination.tabs.length))
        : destination.tabs.length;

    destination.tabs.splice(index, 0, ...inserted.tabs);
    destination.selectedId = inserted.selectedId ?? inserted.tabs[0].id;

    // The destination's recently selected tabs are more recent than the inserted tabset's (see updateRecentTabIds)
    if (inserted.recentTabIds) {
      destination.recentTabIds = [
        ...(destination.recentTabIds ?? []),
        ...inserted.recentTabIds
      ];
    }

    // One of the inserted tabs is selected, so a collapsed tabset expands to show it
    if (destination.collapsed) {
      return expandTabset(normalizeModel(next), destination.id);
    }
  } else {
    // The tabset fills the space it's given (like a tabset moved within a workspace; see moveTabset)
    delete inserted.collapsed;
    delete inserted.size;
    next.root = splitTabset(next.root, destination, inserted, target.region);

    // A maximized tabset that's split is no longer maximized
    if (next.maximizedTabsetId === destination.id) {
      next.maximizedTabsetId = undefined;
    }
  }

  return normalizeModel(next);
}
