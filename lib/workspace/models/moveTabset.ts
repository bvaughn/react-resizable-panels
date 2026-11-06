import { copyModel } from "./copyModel";
import { findParent } from "./findParent";
import { findTabset } from "./findTabset";
import { insertAtDropTarget } from "./insertAtDropTarget";
import type { TabDropTarget, TabsetNode, WorkspaceModel } from "../types";

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

  let inserted: TabsetNode<TabData, TabsetData>;
  if ("index" in target || target.region === "center") {
    if (source.tabs.length === 0) {
      return model;
    }

    // The source is emptied, so that normalizing the model removes it (unless it's kept when empty)
    inserted = { ...source };
    source.tabs = [];
    source.selectedId = undefined;
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

  return insertAtDropTarget(next, destination, inserted, target);
}
