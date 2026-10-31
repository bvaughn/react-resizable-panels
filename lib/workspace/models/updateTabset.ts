import { copyModel } from "./copyModel";
import { findTabset } from "./findTabset";
import { normalizeModel } from "./normalizeModel";
import type { WorkspaceImperativeHandle, WorkspaceModel } from "../types";

export function updateTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string,
  changes: Parameters<
    WorkspaceImperativeHandle<TabData, TabsetData>["updateTabset"]
  >[1]
): WorkspaceModel<TabData, TabsetData> {
  if (!findTabset(model, tabsetId)) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabset(next, tabsetId);
  if (tabset) {
    Object.assign(tabset, changes);
  }

  // Turning off keepWhenEmpty may leave an empty tabset to remove
  return normalizeModel(next);
}
