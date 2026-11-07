import { findTabsetContainingTab } from "../models/findTabsetContainingTab";
import { moveTab } from "../models/moveTab";
import { moveTabset } from "../models/moveTabset";
import { toModelDropTarget } from "./toModelDropTarget";
import type { DragSource, WorkspaceDropEdge, WorkspaceModel } from "../types";

/**
 * The fraction of the workspace that a tab (or tabset) dropped at one of its edges would fill (see insertAtWorkspaceEdge),
 * so that the drop indicator previews it.
 *
 * Drops from this workspace are previewed exactly, since the space a moved tabset leaves is shared by its siblings first;
 * drops from other workspaces (or a source that isn't known) are estimated from the current layout.
 */
export function getWorkspaceEdgeShare(
  model: WorkspaceModel,
  edge: WorkspaceDropEdge,
  source: DragSource | undefined,
  isRightToLeft: boolean = false
): number {
  const orientation =
    edge === "left" || edge === "right" ? "horizontal" : "vertical";

  // The edge is a side of the screen, but the model functions expect model order (see toModelDropTarget);
  // it matters because whether a move is a no-op (and so falls back to an estimate) depends on the side
  const modelTarget = toModelDropTarget({ edge }, isRightToLeft);
  const modelEdge = "edge" in modelTarget ? modelTarget.edge : edge;

  let next: WorkspaceModel | undefined;
  let insertedId: string | undefined;
  if (source?.type === "tab") {
    next = moveTab(model, source.tabId, { edge: modelEdge });
    insertedId = findTabsetContainingTab(next, source.tabId)?.id;
  } else if (source?.type === "tabset") {
    next = moveTabset(model, source.tabsetId, { edge: modelEdge });
    insertedId = source.tabsetId;
  }

  if (next !== undefined && next !== model) {
    const { root } = next;
    const inserted =
      root.type === "split" && root.orientation === orientation
        ? root.children.find(({ id }) => id === insertedId)
        : undefined;
    if (typeof inserted?.size === "number") {
      return inserted.size / 100;
    }
  }

  // Collapsed tabsets take no space in the split, but the preview covers the whole layout, so it can be a little larger than the result
  // Shares the root split's space equally with its expanded children, or the workspace with the root
  const { root } = model;
  if (root.type === "split" && root.orientation === orientation) {
    const expanded = root.children.filter(
      (child) => child.type !== "tabset" || !child.collapsed
    );

    return 1 / (expanded.length + 1);
  }

  return 0.5;
}
