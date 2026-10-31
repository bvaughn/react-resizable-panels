import { useContext } from "react";
import { ParentWorkspaceContext } from "../contexts/ParentWorkspaceContext";
import type { ParentWorkspace } from "../types";

/**
 * Returns the nearest ancestor Workspace (or null if the component is not rendered within a Workspace).
 *
 * ℹ️ The returned value includes the Workspace's imperative API; it does not change when the Workspace's model changes.
 */
export function useParentWorkspace<
  TabData = unknown,
  TabsetData = unknown
>(): ParentWorkspace<TabData, TabsetData> | null {
  return useContext(ParentWorkspaceContext) as ParentWorkspace<
    TabData,
    TabsetData
  > | null;
}
