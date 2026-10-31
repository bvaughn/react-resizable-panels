import { getAllTabsets } from "./getAllTabsets";
import type { TabNode, WorkspaceNode } from "../types";

export function getAllTabs<TabData, TabsetData>(
  node: WorkspaceNode<TabData, TabsetData>
): TabNode<TabData>[] {
  return getAllTabsets(node).flatMap((tabset) => tabset.tabs);
}
