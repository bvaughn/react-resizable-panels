import { getAllTabsets } from "./getAllTabsets";
import type { TabsetNode, WorkspaceModel } from "../types";

export function findTabsetContainingTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string
): TabsetNode<TabData, TabsetData> | undefined {
  return getAllTabsets(model.root).find(({ tabs }) =>
    tabs.some(({ id }) => id === tabId)
  );
}
