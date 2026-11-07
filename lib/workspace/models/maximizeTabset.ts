import { getAllTabsets } from "./getAllTabsets";
import type { WorkspaceModel } from "../types";

export function maximizeTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string
): WorkspaceModel<TabData, TabsetData> {
  if (
    model.maximizedTabsetId === tabsetId ||
    // The only tabset in a workspace already fills it
    model.root.id === tabsetId ||
    // Floating tabsets can't be maximized
    !getAllTabsets(model.root).some(({ id }) => id === tabsetId)
  ) {
    return model;
  }

  return { ...model, maximizedTabsetId: tabsetId };
}
