import { useState } from "react";
import type { WorkspaceImperativeHandle } from "../types";

/**
 * Convenience hook to return a properly typed ref callback for the Workspace component.
 *
 * Use this hook when you need to share the ref with another component or hook.
 */
export function useWorkspaceCallbackRef<
  TabData = unknown,
  TabsetData = unknown
>() {
  return useState<WorkspaceImperativeHandle<TabData, TabsetData> | null>(null);
}
