import type {
  SplitNode,
  TabsetNode,
  WorkspaceModel,
  WorkspaceNode
} from "../types";

export type ModelIndex = {
  nodeIds: Set<string>;
  parentsById: Map<string, SplitNode>;
  tabsetsById: Map<string, TabsetNode>;
  tabsetsByTabId: Map<string, TabsetNode>;
};

/**
 * Indexes a model's nodes, so that components can find a tab's tabset (or a node's parent split) without walking the whole tree.
 */
export function indexModel(model: WorkspaceModel): ModelIndex {
  const index: ModelIndex = {
    nodeIds: new Set(),
    parentsById: new Map(),
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
      for (const child of node.children) {
        index.parentsById.set(child.id, node);
        visit(child);
      }
    }
  };
  visit(model.root);

  return index;
}
