import { useContext, useMemo } from "react";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import { WorkspaceContext } from "../contexts/WorkspaceContext";
import type { ParentTabsetState } from "../types";

/**
 * Returns the state of the nearest ancestor tabset (or null if the component is not rendered within a tabset or the content of a tab).
 *
 * ℹ️ Components that use this hook re-render when the tabset's state changes.
 */
export function useParentTabsetState(): ParentTabsetState | null {
  const workspace = useContext(WorkspaceContext);
  const parentTabset = useContext(ParentTabsetContext);

  const tabset =
    workspace && parentTabset
      ? workspace.modelIndex.tabsetsById.get(parentTabset.id)
      : undefined;

  const isActive =
    tabset !== undefined && workspace?.activeTabsetId === tabset.id;
  const isMaximized =
    tabset !== undefined && workspace?.model.maximizedTabsetId === tabset.id;
  const isRoot = tabset !== undefined && workspace?.model.root.id === tabset.id;
  const selectedTabId = tabset?.selectedId;

  // Tabset objects are replaced whenever the model changes, so only whether there is one is a dependency
  const hasTabset = tabset !== undefined;

  return useMemo(
    () => (hasTabset ? { isActive, isMaximized, isRoot, selectedTabId } : null),
    [hasTabset, isActive, isMaximized, isRoot, selectedTabId]
  );
}
