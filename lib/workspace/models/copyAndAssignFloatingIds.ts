import type {
  FloatingTabsetNode,
  FloatingTabsetNodeInput,
  WorkspaceNode
} from "../types";

/**
 * Copies floating tabsets (like copyAndAssignIds), assigning ids to those that don't have them, based on their positions (e.g. "floating-0")
 * so that they match when server rendering and hydrating; ids already used by the layout (or other floating tabsets) are avoided.
 */
export function copyAndAssignFloatingIds<TabData, TabsetData>(
  floating: FloatingTabsetNodeInput<TabData, TabsetData>[],
  root: WorkspaceNode<TabData, TabsetData>
): FloatingTabsetNode<TabData, TabsetData>[] {
  const usedIds = new Set<string>();
  const collectIds = (node: WorkspaceNode<TabData, TabsetData>) => {
    usedIds.add(node.id);
    if (node.type === "split") {
      node.children.forEach(collectIds);
    }
  };
  collectIds(root);
  for (const tabset of floating) {
    if (tabset.id !== undefined) {
      usedIds.add(tabset.id);
    }
  }

  return floating.map((tabset, index) => {
    let id = tabset.id;
    if (id === undefined) {
      const base = `floating-${index}`;
      id = base;
      let suffix = 1;
      while (usedIds.has(id)) {
        suffix++;
        id = `${base}-${suffix}`;
      }
      usedIds.add(id);
    }

    return { ...tabset, id, tabs: tabset.tabs.map((tab) => ({ ...tab })) };
  });
}
