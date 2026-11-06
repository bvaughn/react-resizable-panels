import { copyModel } from "./copyModel";
import { findTab } from "./findTab";
import { findTabsetContainingTab } from "./findTabsetContainingTab";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import { removeTab } from "./removeTab";
import type { WorkspaceModel } from "../types";

export function closeTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string
): WorkspaceModel<TabData, TabsetData> {
  if (!findTab(model, tabId)) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabsetContainingTab(next, tabId);
  if (tabset) {
    removeTab(tabset, tabId);
  }

  return normalizeCopiedModel(next);
}
