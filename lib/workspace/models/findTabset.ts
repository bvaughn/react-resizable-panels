import { getModelTabsets } from "./getModelTabsets";
import type { TabsetNode, WorkspaceModel } from "../types";

// Floating tabsets are found too (see WorkspaceModel.floating)
export function findTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string | undefined
): TabsetNode<TabData, TabsetData> | undefined {
  return getModelTabsets(model).find(({ id }) => id === tabsetId);
}
