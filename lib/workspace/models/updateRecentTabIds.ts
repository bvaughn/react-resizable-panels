import type {
  TabRemovalSelectionBehavior,
  WorkspaceModel,
  WorkspaceNode
} from "../types";

// Records each tabset's selected tab as its most recently selected one (when the "recent" behavior is used),
// or removes the tabsets' recently selected tabs (otherwise, e.g. after the behavior has changed);
// returns the same model if nothing changed
export function updateRecentTabIds<Model extends WorkspaceModel>(
  model: Model,
  behavior: TabRemovalSelectionBehavior
): Model {
  const root = updateNode(model.root, behavior);

  // Floating tabsets are tabsets too (without layout fields), so they're updated the same way
  const floating = model.floating?.map(
    (tabset) => updateNode(tabset as WorkspaceNode, behavior) as typeof tabset
  );
  const isFloatingChanged = !!floating?.some(
    (tabset, index) => tabset !== model.floating?.[index]
  );

  if (root === model.root && !isFloatingChanged) {
    return model;
  }

  return isFloatingChanged ? { ...model, floating, root } : { ...model, root };
}

function updateNode<Node extends WorkspaceNode>(
  node: Node,
  behavior: TabRemovalSelectionBehavior
): Node {
  if (node.type === "split") {
    const children = node.children.map((child) => updateNode(child, behavior));

    return children.every((child, index) => child === node.children[index])
      ? node
      : { ...node, children };
  }

  const prevIds = node.recentTabIds;
  const selectedId = node.selectedId;
  if (
    behavior === "adjacent" ||
    // A tabset without a selected tab has no tabs to remember
    selectedId === undefined
  ) {
    if (prevIds === undefined) {
      return node;
    }

    const { recentTabIds: _, ...rest } = node;
    return rest as Node;
  }

  if (prevIds?.[0] === selectedId) {
    return node;
  }

  return {
    ...node,
    recentTabIds: [
      selectedId,
      ...(prevIds ?? []).filter((id) => id !== selectedId)
    ]
  };
}
