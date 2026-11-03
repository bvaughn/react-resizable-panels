import type { TabsetNode, WorkspaceNode } from "../types";

export function normalizeNode<Node extends WorkspaceNode>(
  node: Node,
  isRoot: boolean
): Node | null {
  if (node.type === "tabset") {
    if (!node.tabs.some(({ id }) => id === node.selectedId)) {
      node.selectedId = node.tabs[0]?.id;
    }

    // Only collapsible tabsets can be collapsed
    if (!node.collapsible) {
      delete node.collapsed;
    }

    // Recently selected tabs that have been removed (or moved to other tabsets) are forgotten,
    // and invalid values (e.g. from a corrupt saved model) are ignored
    if (node.recentTabIds !== undefined) {
      const recentTabIds = Array.isArray(node.recentTabIds)
        ? node.recentTabIds.filter(
            (id, index, ids) =>
              ids.indexOf(id) === index &&
              node.tabs.some((tab) => tab.id === id)
          )
        : [];

      if (recentTabIds.length > 0) {
        node.recentTabIds = recentTabIds;
      } else {
        delete node.recentTabIds;
      }
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

  // Collapsed tabsets don't fill their split, so at least one child must stay expanded
  const isCollapsed = (child: WorkspaceNode) =>
    child.type === "tabset" && !!child.collapsed;
  if (children.every(isCollapsed)) {
    delete (children[children.length - 1] as TabsetNode).collapsed;
  }

  // Removed children leave space that the remaining children share proportionally;
  // this can only be calculated when all of the sizes are percentages.
  // Collapsed tabsets' sizes are the sizes they expand to, so only expanded children fill the split.
  const expanded = children.filter((child) => !isCollapsed(child));
  if (expanded.every(({ size }) => typeof size === "number")) {
    const total = expanded.reduce((sum, { size }) => sum + (size as number), 0);
    if (total > 0) {
      for (const child of expanded) {
        child.size = ((child.size as number) / total) * 100;
      }
    }
  }

  return { ...node, children } as Node;
}
