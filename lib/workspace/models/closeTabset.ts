import { copyModel } from "./copyModel";
import { findTabset } from "./findTabset";
import { normalizeModel } from "./normalizeModel";
import type { WorkspaceModel } from "../types";

// The tabset is emptied (and no longer kept when empty), so that normalizing the model removes it;
// a root tabset is left in place (empty), since a workspace always has a root
export function closeTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string
): WorkspaceModel<TabData, TabsetData> {
  if (!findTabset(model, tabsetId)) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabset(next, tabsetId);
  if (tabset) {
    tabset.tabs = [];
    tabset.selectedId = undefined;
    delete tabset.keepWhenEmpty;
  }

  return normalizeModel(next);
}
