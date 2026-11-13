import { useCallback, useContext, useSyncExternalStore } from "react";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import { ParentWorkspaceContext } from "../contexts/ParentWorkspaceContext";
import type { TabListOverflowOptions } from "../types";

const EMPTY_TAB_IDS: string[] = [];

/**
 * Returns the ids of the nearest ancestor tabset's tabs that are out of view (scrolled out of its tab list, which overflows),
 * in the order they're shown; e.g. for an overflow menu in its toolbar (see `renderTabsetToolbar`) that lists them.
 * See `WorkspaceImperativeHandle.getTabListOverflow`.
 *
 * ℹ️ The component re-renders when they change (e.g. when the tab list is scrolled or resized, or tabs are added or removed), before the browser paints.
 * The same array is returned until then.
 *
 * @param options.includePartiallyVisible Also include tabs that are only partly visible (cut off by an edge of the tab list)
 * @returns The ids of the tabs that are out of view; none if the component is not rendered within a tabset (or the tab list hasn't been measured yet, e.g. while server rendering, or right after the tabset is first rendered)
 */
export function useTabListOverflow({
  includePartiallyVisible = false
}: TabListOverflowOptions = {}): string[] {
  const workspace = useContext(ParentWorkspaceContext);
  const tabsetId = useContext(ParentTabsetContext)?.id;

  const subscribe = useCallback(
    (onChange: () => void) =>
      workspace && tabsetId !== undefined
        ? workspace.subscribeToTabListOverflow(tabsetId, onChange, {
            includePartiallyVisible
          })
        : () => {},
    [includePartiallyVisible, tabsetId, workspace]
  );
  const getSnapshot = () =>
    (workspace && tabsetId !== undefined
      ? workspace.getTabListOverflow(tabsetId, { includePartiallyVisible })
      : undefined) ?? EMPTY_TAB_IDS;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getServerSnapshot() {
  return EMPTY_TAB_IDS;
}
