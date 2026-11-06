import { indexModel } from "./indexModel";
import type { DragNode, TabDropTarget, WorkspaceModel } from "../types";

/**
 * Whether a tab (or tabset) dropped in from another workspace (see the Workspace's dragGroup prop) has the same id as one of this model's nodes.
 * Ids are kept when moving between workspaces (since applications may refer to them), so these drops are rejected rather than given new ids.
 *
 * A tabset's own id only matters where the tabset is inserted whole (an edge region); elsewhere only its tabs are inserted.
 */
export function hasConflictingIds(
  model: WorkspaceModel,
  node: DragNode,
  target: TabDropTarget
) {
  const { nodeIds, tabsetsByTabId } = indexModel(model);

  // Ids are unique across tabs, tabsets, and splits
  const isTaken = (id: string) => nodeIds.has(id) || tabsetsByTabId.has(id);
  if (node.type === "tab") {
    return isTaken(node.tab.id);
  }

  const isInsertedWhole = "region" in target && target.region !== "center";

  return (
    (isInsertedWhole && isTaken(node.tabset.id)) ||
    node.tabset.tabs.some(({ id }) => isTaken(id))
  );
}
