import { getModelIndex } from "../models/getModelIndex";
import { getModelTabsets } from "../models/getModelTabsets";
import { isAtWorkspaceEdge } from "../models/isAtWorkspaceEdge";
import type {
  TabDropRegion,
  TabDropTarget,
  TabsetNode,
  WorkspaceDropEdge,
  WorkspaceModel
} from "../types";
import { toModelDropTarget } from "./toModelDropTarget";

const REGIONS: TabDropRegion[] = ["left", "right", "top", "bottom"];
const EDGES: WorkspaceDropEdge[] = ["left", "right", "top", "bottom"];

/**
 * Where a tab can be moved from the keyboard (see the Workspace's move mode), in the order the arrow keys cycle through them:
 * each tabset in layout order (then the floating tabsets), followed by the edges of the workspace.
 *
 * The targets are the ones a drag could drop the tab at (before `disableDrop` is checked), so they're sides of the screen
 * like a drag's targets (see toModelDropTarget):
 * - Into another tabset (its center, or the end of its tab list while it's collapsed, since its panels aren't shown)
 * - Beside a tabset, splitting it (unless it's floating, or the tab is the only tab of that tabset)
 * - At an edge of the workspace (unless a tabset is maximized, or the tab's own tabset already fills that edge and would be left empty)
 */
export function getKeyboardMoveTargets({
  isCollapsed,
  isRightToLeft,
  model,
  tabId
}: {
  /** Whether a tabset is shown collapsed (which may differ from the model, see isTabsetCollapsed) */
  isCollapsed: (tabset: TabsetNode) => boolean;
  isRightToLeft: boolean;
  model: WorkspaceModel;
  tabId: string;
}): TabDropTarget[] {
  const modelIndex = getModelIndex(model);
  const source = modelIndex.tabsetsByTabId.get(tabId);
  if (!source) {
    return [];
  }

  // While a tabset is maximized, tabs can only be dropped within it (or within floating tabsets, which are shown above it)
  const maximizedId = model.maximizedTabsetId;
  const tabsets = getModelTabsets(model).filter(
    (tabset) =>
      maximizedId === undefined ||
      tabset.id === maximizedId ||
      modelIndex.floatingTabsetIds.has(tabset.id)
  );

  // Moving a tab out of a tabset that it's the only tab of removes the tabset (unless it's kept when empty)
  const isOnlyTab = source.tabs.length === 1 && !source.keepWhenEmpty;

  const targets: TabDropTarget[] = [];
  for (const tabset of tabsets) {
    const isOwn = tabset.id === source.id;
    const isFloating = modelIndex.floatingTabsetIds.has(tabset.id);

    // A maximized tabset is shown expanded
    if (tabset.id !== maximizedId && isCollapsed(tabset)) {
      // Collapsed tabsets don't show their panels, so tabs are added to the end of their tab lists (as with drops at the edges they line)
      if (!isOwn) {
        targets.push({ index: tabset.tabs.length, tabsetId: tabset.id });
      }
      continue;
    }

    // Moving a tab into the center of its own tabset would only move it to the end of the list
    if (!isOwn) {
      targets.push({ region: "center", tabsetId: tabset.id });
    }

    // Splitting an empty tabset would remove it (unless it's kept when empty), and floating tabsets can't be split
    const isSplittable =
      (tabset.tabs.length > 0 || !!tabset.keepWhenEmpty) &&
      !isFloating &&
      !(isOwn && isOnlyTab);
    if (isSplittable) {
      for (const region of REGIONS) {
        targets.push({ region, tabsetId: tabset.id });
      }
    }
  }

  // The edges of a root tabset are already its own regions
  if (maximizedId === undefined && model.root.type === "split") {
    for (const edge of EDGES) {
      // Edges are sides of the screen, so they're converted to the model's order first
      const modelTarget = toModelDropTarget({ edge }, isRightToLeft);
      const modelEdge = "edge" in modelTarget ? modelTarget.edge : edge;
      if (isOnlyTab && isAtWorkspaceEdge(model.root, source, modelEdge)) {
        continue;
      }

      targets.push({ edge });
    }
  }

  return targets;
}
