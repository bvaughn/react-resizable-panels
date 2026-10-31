import type { WorkspaceNode } from "../types";

export function normalizeNode<Node extends WorkspaceNode>(
  node: Node,
  isRoot: boolean
): Node | null {
  if (node.type === "tabset") {
    if (!node.tabs.some(({ id }) => id === node.selectedId)) {
      node.selectedId = node.tabs[0]?.id;
    }

    return node.tabs.length > 0 || isRoot || node.keepWhenEmpty ? node : null;
  }

  const children: WorkspaceNode[] = [];
  for (const child of node.children) {
    const normalized = normalizeNode(child, false);
    if (normalized === null) {
      continue;
    } else if (
      normalized.type === "split" &&
      normalized.orientation === node.orientation
    ) {
      // Grandchild sizes are relative to the merged split
      for (const grandchild of normalized.children) {
        children.push({
          ...grandchild,
          size:
            typeof grandchild.size === "number" &&
            typeof normalized.size === "number"
              ? (grandchild.size * normalized.size) / 100
              : undefined
        });
      }
    } else {
      children.push(normalized);
    }
  }

  if (children.length === 0) {
    return null;
  } else if (children.length === 1) {
    return { ...children[0], size: node.size } as Node;
  }

  // Removed children leave space that the remaining children share proportionally;
  // this can only be calculated when all of the sizes are percentages
  if (children.every(({ size }) => typeof size === "number")) {
    const total = children.reduce((sum, { size }) => sum + (size as number), 0);
    if (total > 0) {
      for (const child of children) {
        child.size = ((child.size as number) / total) * 100;
      }
    }
  }

  return { ...node, children } as Node;
}
