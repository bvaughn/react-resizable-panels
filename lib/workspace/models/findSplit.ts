import type { SplitNode, WorkspaceNode } from "../types";

export function findSplit(
  node: WorkspaceNode,
  id: string
): SplitNode | undefined {
  if (node.type === "split") {
    if (node.id === id) {
      return node;
    }

    for (const child of node.children) {
      const match = findSplit(child, id);
      if (match) {
        return match;
      }
    }
  }
}
