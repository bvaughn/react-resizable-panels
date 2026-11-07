import type { TabsetNode, WorkspaceDropEdge, WorkspaceNode } from "../types";

/**
 * Whether a tabset already fills an edge of the workspace (the root tabset, or the first or last child of a root split in that direction),
 * so that moving it to that edge would leave the layout unchanged.
 */
export function isAtWorkspaceEdge(
  root: WorkspaceNode,
  tabset: TabsetNode,
  edge: WorkspaceDropEdge
): boolean {
  if (root.type === "tabset") {
    return root.id === tabset.id;
  }

  const orientation =
    edge === "left" || edge === "right" ? "horizontal" : "vertical";
  if (root.orientation !== orientation) {
    return false;
  }

  const child =
    edge === "left" || edge === "top"
      ? root.children[0]
      : root.children[root.children.length - 1];

  return child?.id === tabset.id;
}
