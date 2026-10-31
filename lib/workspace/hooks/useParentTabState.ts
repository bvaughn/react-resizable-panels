import { useContext, useMemo } from "react";
import { ParentTabContext } from "../contexts/ParentTabContext";
import { WorkspaceContext } from "../contexts/WorkspaceContext";
import type { ParentTabState } from "../types";

/**
 * Returns the state of the nearest ancestor tab (or null if the component is not rendered within a tab (see `renderTab`) or the content of a tab).
 *
 * ℹ️ Components that use this hook re-render when the tab's state changes.
 */
export function useParentTabState(): ParentTabState | null {
  const workspace = useContext(WorkspaceContext);
  const parentTab = useContext(ParentTabContext);

  const tabset =
    workspace && parentTab
      ? workspace.modelIndex.tabsetsByTabId.get(parentTab.id)
      : undefined;
  const tab = tabset?.tabs.find(({ id }) => id === parentTab?.id);

  const disabled = !!workspace?.disabled;
  const isCloseDisabled = disabled || !!tab?.disableClose;
  const isDragDisabled = disabled || !!tab?.disableDrag;
  const isSelected = tab !== undefined && tabset?.selectedId === tab.id;
  const maximizedTabsetId = workspace?.model.maximizedTabsetId;
  const isVisible =
    isSelected &&
    (maximizedTabsetId === undefined || maximizedTabsetId === tabset?.id);
  const tabsetId = tabset?.id;

  return useMemo(
    () =>
      tabsetId !== undefined
        ? { isCloseDisabled, isDragDisabled, isSelected, isVisible, tabsetId }
        : null,
    [isCloseDisabled, isDragDisabled, isSelected, isVisible, tabsetId]
  );
}
