import type { WorkspaceNode, WorkspaceNodeInput } from "../types";

/**
 * Copies a node's structure (like copyStructure), assigning ids to splits and tabsets that don't have them.
 *
 * ℹ️ Ids are based on each node's position (e.g. "tabset-0-1" is the second child of the root's first child)
 * rather than random, so that they match when server rendering and hydrating.
 */
export function copyAndAssignIds<TabData, TabsetData>(
  root: WorkspaceNodeInput<TabData, TabsetData>
): WorkspaceNode<TabData, TabsetData> {
  const usedIds = new Set<string>();
  const collectIds = (node: WorkspaceNodeInput<TabData, TabsetData>) => {
    if (node.id !== undefined) {
      usedIds.add(node.id);
    }
    if (node.type === "split") {
      node.children.forEach(collectIds);
    }
  };
  collectIds(root);

  const getId = (
    node: WorkspaceNodeInput<TabData, TabsetData>,
    path: number[]
  ) => {
    if (node.id !== undefined) {
      return node.id;
    }

    // Avoid ids that are already used (e.g. an explicit id of "tabset-0")
    const base = `${node.type}-${path.length > 0 ? path.join("-") : "root"}`;
    let id = base;
    let suffix = 1;
    while (usedIds.has(id)) {
      suffix++;
      id = `${base}-${suffix}`;
    }
    usedIds.add(id);

    return id;
  };

  const copy = (
    node: WorkspaceNodeInput<TabData, TabsetData>,
    path: number[]
  ): WorkspaceNode<TabData, TabsetData> =>
    node.type === "split"
      ? {
          ...node,
          children: node.children.map((child, index) =>
            copy(child, [...path, index])
          ),
          id: getId(node, path)
        }
      : {
          ...node,
          id: getId(node, path),
          tabs: node.tabs.map((tab) => ({ ...tab }))
        };

  return copy(root, []);
}
