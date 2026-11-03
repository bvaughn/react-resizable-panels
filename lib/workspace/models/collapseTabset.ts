import { canCollapseTabset } from "./canCollapseTabset";
import { copyModel } from "./copyModel";
import { findParent } from "./findParent";
import { findTabset } from "./findTabset";
import { normalizeModel } from "./normalizeModel";
import type { WorkspaceModel } from "../types";

// The tabset keeps its size (to expand to); its siblings share the rest of the split (see normalizeModel)
export function collapseTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string
): WorkspaceModel<TabData, TabsetData> {
  const current = findTabset(model, tabsetId);
  if (
    !current ||
    current.collapsed ||
    !canCollapseTabset(findParent(model.root, tabsetId), current)
  ) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabset(next, tabsetId);
  if (tabset) {
    tabset.collapsed = true;
  }

  return normalizeModel(next);
}
