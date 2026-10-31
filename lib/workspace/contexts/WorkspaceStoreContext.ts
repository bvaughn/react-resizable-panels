import { createContext } from "react";
import type { WorkspaceStore } from "../utils/createWorkspaceStore";

/**
 * Store of the nearest Workspace (see createWorkspaceStore).
 *
 * ℹ️ This value does not change for the life of the Workspace.
 */
export const WorkspaceStoreContext = createContext<WorkspaceStore | null>(null);
