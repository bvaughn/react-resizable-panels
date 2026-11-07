import { expandCopiedTabset } from "./expandCopiedTabset";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import { splitTabset } from "./splitTabset";
import type {
  TabDropTarget,
  TabsetNode,
  WorkspaceDropEdge,
  WorkspaceModel
} from "../types";

/**
 * Inserts a dropped tabset into a model whose tree has already been copied (see copyModel), and normalizes it;
 * used for tabs and tabsets moved within the workspace (after they're removed from their sources) and dropped in from other workspaces.
 * - Edge regions split the destination, inserting the tabset beside it
 * - Other targets insert the tabset's tabs into the destination (selecting the tabset's selected tab); the tabset must have tabs
 *
 * A tab is inserted as a new tabset containing only that tab.
 */
export function insertAtDropTarget<TabData, TabsetData>(
  next: WorkspaceModel<TabData, TabsetData>,
  destination: TabsetNode<TabData, TabsetData>,
  inserted: TabsetNode<TabData, TabsetData>,
  // Edges of the workspace have no destination tabset (see insertAtWorkspaceEdge)
  target: Exclude<TabDropTarget, { edge: WorkspaceDropEdge }>,
  {
    expandCollapsedDestination = true
  }: {
    // Whether a collapsed destination expands to show the inserted tabs (e.g. not when a collapsed tabset's tabs are reordered)
    expandCollapsedDestination?: boolean;
  } = {}
): WorkspaceModel<TabData, TabsetData> {
  if ("index" in target || target.region === "center") {
    const index =
      "index" in target
        ? Math.max(0, Math.min(target.index, destination.tabs.length))
        : destination.tabs.length;

    destination.tabs.splice(index, 0, ...inserted.tabs);
    destination.selectedId = inserted.selectedId ?? inserted.tabs[0].id;

    // The destination's recently selected tabs are more recent than the inserted tabset's (see updateRecentTabIds)
    if (inserted.recentTabIds) {
      destination.recentTabIds = [
        ...(destination.recentTabIds ?? []),
        ...inserted.recentTabIds
      ];
    }

    // One of the inserted tabs is selected, so a collapsed tabset expands to show it (like when one of its tabs is clicked);
    // it's expanded once the model is normalized, since expanding depends on its siblings' normalized sizes
    if (destination.collapsed && expandCollapsedDestination) {
      const normalized = normalizeCopiedModel(next);

      return expandCopiedTabset(normalized, destination.id)
        ? normalizeCopiedModel(normalized)
        : normalized;
    }
  } else {
    // The tabset fills the space it's given (rather than staying collapsed in it)
    delete inserted.collapsed;
    next.root = splitTabset(next.root, destination, inserted, target.region);

    // A maximized tabset that's split is no longer maximized
    if (next.maximizedTabsetId === destination.id) {
      next.maximizedTabsetId = undefined;
    }
  }

  return normalizeCopiedModel(next);
}
