import { findTabset } from "./findTabset";
import type { WorkspaceModel } from "../types";

export function maximizeTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string
): WorkspaceModel<TabData, TabsetData> {
  if (
    model.maximizedTabsetId === tabsetId ||
    // The only tabset in a workspace already fills it
    model.root.id === tabsetId ||
    !findTabset(model, tabsetId)
  ) {
    return model;
  }

  return { ...model, maximizedTabsetId: tabsetId };
}
