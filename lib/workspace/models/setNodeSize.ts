import { copyModel } from "./copyModel";
import { findParent } from "./findParent";
import type { WorkspaceModel, WorkspaceNode } from "../types";

/**
 * Sets the size of a node within its split, or of the root (e.g. a row of a workspace with the `growDirection` prop).
 */
export function setNodeSize<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  nodeId: string,
  size: number | string
): WorkspaceModel<TabData, TabsetData> {
  // The root has no parent (e.g. the only row of a workspace with the growDirection prop)
  const getNode = (root: WorkspaceNode<TabData, TabsetData>) =>
    root.id === nodeId
      ? root
      : (findParent(root, nodeId)?.children.find(({ id }) => id === nodeId) as
          | WorkspaceNode<TabData, TabsetData>
          | undefined);

  const node = getNode(model.root);
  if (!node || node.size === size) {
    return model;
  }

  const next = copyModel(model);
  getNode(next.root)!.size = size;

  return next;
}
