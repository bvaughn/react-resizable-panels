import { copyModel } from "./copyModel";
import { createTabset } from "./createTabset";
import { expandTabset } from "./expandTabset";
import { findTabset } from "./findTabset";
import { normalizeModel } from "./normalizeModel";
import { splitTabset } from "./splitTabset";
import type { TabDropTarget, TabNode, WorkspaceModel } from "../types";

// Inserts a tab dropped in from another workspace (see the Workspace's dragGroup prop), like moveTab does for a tab from this workspace
export function insertTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tab: TabNode<TabData>,
  target: TabDropTarget
): WorkspaceModel<TabData, TabsetData> {
  const next = copyModel(model);
  const destination = findTabset(next, target.tabsetId);
  if (!destination) {
    return model;
  }

  if ("index" in target || target.region === "center") {
    const index =
      "index" in target
        ? Math.max(0, Math.min(target.index, destination.tabs.length))
        : destination.tabs.length;

    destination.tabs.splice(index, 0, { ...tab });
    destination.selectedId = tab.id;

    // The dropped tab is selected, so a collapsed tabset expands to show it
    if (destination.collapsed) {
      return expandTabset(normalizeModel(next), destination.id);
    }
  } else {
    next.root = splitTabset(
      next.root,
      destination,
      createTabset([{ ...tab }]),
      target.region
    );

    // A maximized tabset that's split is no longer maximized
    if (next.maximizedTabsetId === destination.id) {
      next.maximizedTabsetId = undefined;
    }
  }

  return normalizeModel(next);
}
