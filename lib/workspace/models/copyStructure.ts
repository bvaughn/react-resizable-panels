import type { WorkspaceNode } from "../types";

// Copies splits, tabsets, and tabs (so they can be changed) but not application data
export function copyStructure<Node extends WorkspaceNode>(node: Node): Node {
  return node.type === "split"
    ? { ...node, children: node.children.map(copyStructure) }
    : { ...node, tabs: node.tabs.map((tab) => ({ ...tab })) };
}
