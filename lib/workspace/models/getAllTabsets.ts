import type { TabsetNode, WorkspaceNode } from "../types";

/**
 * Tabsets in tree (and document) order.
 */
export function getAllTabsets<TabData, TabsetData>(
  node: WorkspaceNode<TabData, TabsetData>
): TabsetNode<TabData, TabsetData>[] {
  return node.type === "tabset"
    ? [node]
    : node.children.flatMap((child) => getAllTabsets(child));
}
