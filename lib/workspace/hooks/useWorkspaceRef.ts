import { useRef } from "react";
import type { WorkspaceImperativeHandle } from "../types";

/**
 * Convenience hook to return a properly typed ref for the Workspace component.
 */
export function useWorkspaceRef<TabData = unknown, TabsetData = unknown>() {
  return useRef<WorkspaceImperativeHandle<TabData, TabsetData> | null>(null);
}
