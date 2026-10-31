import { findTabsetContainingTab } from "./findTabsetContainingTab";
import type { TabNode, WorkspaceModel } from "../types";

export function findTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string
): TabNode<TabData> | undefined {
  return findTabsetContainingTab(model, tabId)?.tabs.find(
    ({ id }) => id === tabId
  );
}
