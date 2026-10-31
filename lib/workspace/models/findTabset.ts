import { getAllTabsets } from "./getAllTabsets";
import type { TabsetNode, WorkspaceModel } from "../types";

export function findTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string | undefined
): TabsetNode<TabData, TabsetData> | undefined {
  return getAllTabsets(model.root).find(({ id }) => id === tabsetId);
}
