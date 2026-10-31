import { useContext } from "react";
import { assert } from "../../shared/utils/assert";
import { TabsetContext } from "../contexts/TabsetContext";
import { WorkspaceContext } from "../contexts/WorkspaceContext";

export function useWorkspaceContext(componentName: string) {
  const context = useContext(WorkspaceContext);
  assert(context, `${componentName} must be rendered within a Workspace`);

  return context;
}

export function useTabsetContext(componentName: string) {
  const context = useContext(TabsetContext);
  assert(context, `${componentName} must be rendered within a tabset`);

  return context;
}
