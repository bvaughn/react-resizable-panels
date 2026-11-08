import { getModelTabsets } from "./getModelTabsets";
import type { TabsetNode, WorkspaceModel } from "../types";

// Floating tabsets are searched too (see WorkspaceModel.floating)
export function findTabsetContainingTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string
): TabsetNode<TabData, TabsetData> | undefined {
  return getModelTabsets(model).find(({ tabs }) =>
    tabs.some(({ id }) => id === tabId)
  );
}
