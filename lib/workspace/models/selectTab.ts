import { copyModel } from "./copyModel";
import { findTabsetContainingTab } from "./findTabsetContainingTab";
import type { WorkspaceModel } from "../types";

export function selectTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string
): WorkspaceModel<TabData, TabsetData> {
  const current = findTabsetContainingTab(model, tabId);
  if (!current || current.selectedId === tabId) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabsetContainingTab(next, tabId);
  if (tabset) {
    tabset.selectedId = tabId;
  }

  return next;
}
