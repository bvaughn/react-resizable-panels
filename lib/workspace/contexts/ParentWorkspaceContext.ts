import { createContext } from "react";
import type { ParentWorkspace } from "../types";

export const ParentWorkspaceContext = createContext<ParentWorkspace | null>(
  null
);
