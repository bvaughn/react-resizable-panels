import { copyModel } from "./copyModel";
import { findTab } from "./findTab";
import type { WorkspaceImperativeHandle, WorkspaceModel } from "../types";

export function updateTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string,
  changes: Parameters<
    WorkspaceImperativeHandle<TabData, TabsetData>["updateTab"]
  >[1]
): WorkspaceModel<TabData, TabsetData> {
  if (!findTab(model, tabId)) {
    return model;
  }

  const next = copyModel(model);
  const tab = findTab(next, tabId);
  if (tab) {
    Object.assign(tab, changes);
  }

  return next;
}
