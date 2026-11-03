import { copyModel } from "./copyModel";
import { expandTabset } from "./expandTabset";
import { findParent } from "./findParent";
import { findTabset } from "./findTabset";
import { normalizeModel } from "./normalizeModel";
import { splitTabset } from "./splitTabset";
import type { TabDropTarget, WorkspaceModel } from "../types";

// Edge regions move the tabset beside the target; other targets move its tabs into the target
// (and the emptied tabset is removed, unless it's kept when empty)
export function moveTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string,
  target: TabDropTarget
): WorkspaceModel<TabData, TabsetData> {
  const next = copyModel(model);
  const source = findTabset(next, tabsetId);
  const destination = findTabset(next, target.tabsetId);
  if (!source || !destination || source === destination) {
    return model;
  }

  if ("index" in target || target.region === "center") {
    if (source.tabs.length === 0) {
      return model;
    }

    const index =
      "index" in target
        ? Math.max(0, Math.min(target.index, destination.tabs.length))
        : destination.tabs.length;

    destination.tabs.splice(index, 0, ...source.tabs);
    destination.selectedId = source.selectedId ?? source.tabs[0].id;

    // The destination's recently selected tabs are more recent than the source's (see updateRecentTabIds)
    if (source.recentTabIds) {
      destination.recentTabIds = [
        ...(destination.recentTabIds ?? []),
        ...source.recentTabIds
      ];
    }

    source.tabs = [];
    source.selectedId = undefined;

    // One of the moved tabs is selected, so a collapsed tabset expands to show it (like when one of its tabs is clicked)
    if (destination.collapsed) {
      return expandTabset(normalizeModel(next), destination.id);
    }
  } else {
    // The source can't be the root, since the destination is another tabset
    const parent = findParent(next.root, source.id);
    if (!parent) {
      return model;
    }

    // Siblings share the space the tabset leaves (see normalizeModel); splitting the destination gives it new space,
    // which it fills (rather than staying collapsed in it)
    delete source.collapsed;
    parent.children.splice(parent.children.indexOf(source), 1);
    next.root = splitTabset(next.root, destination, source, target.region);

    // A maximized tabset that's split is no longer maximized
    if (next.maximizedTabsetId === destination.id) {
      next.maximizedTabsetId = undefined;
    }
  }

  return normalizeModel(next);
}
