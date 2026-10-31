import type { SplitNode, WorkspaceNode } from "../types";

export function findParent(
  node: WorkspaceNode,
  id: string
): SplitNode | undefined {
  if (node.type === "split") {
    for (const child of node.children) {
      if (child.id === id) {
        return node;
      }

      const match = findParent(child, id);
      if (match) {
        return match;
      }
    }
  }
}
