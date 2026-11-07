import { createId } from "./createId";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import type {
  SplitNode,
  TabsetNode,
  WorkspaceDropEdge,
  WorkspaceModel
} from "../types";

/**
 * Inserts a dropped tabset at an edge of the workspace, beside all of the other tabsets, into a model whose tree has already been copied (see copyModel),
 * and normalizes it; like insertAtDropTarget, it's used after a moved tab or tabset is removed from its source.
 * - If the root is a split in the same direction, the tabset is added to the start or end of its children,
 *   and takes an equal share of the space (e.g. a third, beside two other children), which the other children give up proportionally
 * - Otherwise the root is wrapped in a new split, and shares it equally with the tabset
 */
export function insertAtWorkspaceEdge<TabData, TabsetData>(
  next: WorkspaceModel<TabData, TabsetData>,
  inserted: TabsetNode<TabData, TabsetData>,
  edge: WorkspaceDropEdge
): WorkspaceModel<TabData, TabsetData> {
  const orientation =
    edge === "left" || edge === "right" ? "horizontal" : "vertical";
  const insertBefore = edge === "left" || edge === "top";

  // The tabset fills the space it's given (rather than staying collapsed in it)
  delete inserted.collapsed;

  // Normalized first so that the space a moved tabset leaves is shared by its siblings,
  // and splits it leaves with a single child are replaced by that child (e.g. so that the root might then be a split in the same direction)
  const normalized = normalizeCopiedModel(next);
  const { root } = normalized;

  if (root.type === "split" && root.orientation === orientation) {
    // Collapsed tabsets don't fill their split (see normalizeNode)
    const expanded = root.children.filter(
      (child) => child.type !== "tabset" || !child.collapsed
    );

    // The normalized sizes add up to 100 (when they're all percentages), so normalizing again scales them to share the space with the tabset
    inserted.size = expanded.every(({ size }) => typeof size === "number")
      ? 100 / expanded.length
      : undefined;

    if (insertBefore) {
      root.children.unshift(inserted);
    } else {
      root.children.push(inserted);
    }
  } else {
    // The root fills the workspace, so it has no size of its own
    root.size = 50;
    inserted.size = 50;

    const split: SplitNode<TabData, TabsetData> = {
      children: insertBefore ? [inserted, root] : [root, inserted],
      id: createId(),
      orientation,
      type: "split"
    };
    normalized.root = split;
  }

  return normalizeCopiedModel(normalized);
}
