import { useCallback, useContext, useSyncExternalStore } from "react";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import { ParentWorkspaceContext } from "../contexts/ParentWorkspaceContext";

/**
 * Returns the space (in pixels) in the nearest ancestor tabset's tab list that its tabs don't use (negative once they overflow),
 * e.g. for a toolbar (see `renderTabsetToolbar`) that moves items into an overflow menu when the tabset's header runs out of room;
 * see `WorkspaceImperativeHandle.getTabListFreeSpace`.
 *
 * ℹ️ The component re-renders when the free space changes, before the browser paints.
 *
 * @returns The free space, or `undefined` if the component is not rendered within a tabset (or the tab list hasn't been measured yet, e.g. while server rendering, or right after the tabset is first rendered)
 */
export function useTabListFreeSpace(): number | undefined {
  const workspace = useContext(ParentWorkspaceContext);
  const tabsetId = useContext(ParentTabsetContext)?.id;

  const subscribe = useCallback(
    (onChange: () => void) =>
      workspace && tabsetId !== undefined
        ? workspace.subscribeToTabListFreeSpace(tabsetId, onChange)
        : () => {},
    [tabsetId, workspace]
  );
  const getSnapshot = () =>
    workspace && tabsetId !== undefined
      ? workspace.getTabListFreeSpace(tabsetId)
      : undefined;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getServerSnapshot() {
  return undefined;
}
