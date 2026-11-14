import { isTabsetCollapsed } from "./isTabsetCollapsed";
import type { TabNode, TabsetNode } from "../types";
import type { WorkspaceState } from "./createWorkspaceStore";

/**
 * Whether a tab is visible (see `ParentTabState.isVisible`): selected, in a tabset that isn't collapsed or covered by a maximized tabset.
 * Pass the Workspace's collapseOverrides to include how tabsets are temporarily shown (previews, collapsing to fit), or an empty object for the model's state only.
 */
export function isTabVisible(
  { model, modelIndex }: Pick<WorkspaceState, "model" | "modelIndex">,
  tabset: TabsetNode,
  tab: TabNode,
  collapseOverrides: { [tabsetId: string]: boolean }
) {
  if (tabset.selectedId !== tab.id) {
    return false;
  }

  const maximizedTabsetId = model.maximizedTabsetId;

  // A maximized tabset is shown expanded, even if it's collapsed;
  // floating tabsets are shown above it, so they're only hidden if they're collapsed
  return maximizedTabsetId === undefined ||
    modelIndex.floatingTabsetIds.has(tabset.id)
    ? !isTabsetCollapsed(tabset, collapseOverrides)
    : maximizedTabsetId === tabset.id;
}
