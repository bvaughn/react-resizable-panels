import type { TabsetNode, WorkspaceModel, WorkspaceNode } from "../types";

export type ModelIndex = {
  nodeIds: Set<string>;
  tabsetsById: Map<string, TabsetNode>;
  tabsetsByTabId: Map<string, TabsetNode>;
};

/**
 * Indexes a model's nodes, so that components can find a tab's tabset without walking the whole tree.
 */
export function indexModel(model: WorkspaceModel): ModelIndex {
  const index: ModelIndex = {
    nodeIds: new Set(),
    tabsetsById: new Map(),
    tabsetsByTabId: new Map()
  };

  const visit = (node: WorkspaceNode) => {
    index.nodeIds.add(node.id);

    if (node.type === "tabset") {
      index.tabsetsById.set(node.id, node);
      for (const tab of node.tabs) {
        index.tabsetsByTabId.set(tab.id, node);
      }
    } else {
      node.children.forEach(visit);
    }
  };
  visit(model.root);

  return index;
}
