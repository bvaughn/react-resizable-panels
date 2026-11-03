import type { WorkspaceChangeReason, WorkspaceNode } from "../types";

// Why a split's layout changed when the user resized it: resizing can collapse or expand its tabsets (like collapsible Panels);
// a resize that collapses one tabset while expanding another is reported as an expansion
export function getResizeReason(
  children: WorkspaceNode[],
  collapsedIds: Set<string>
): WorkspaceChangeReason {
  let isAnyCollapsed = false;
  for (const child of children) {
    if (child.type !== "tabset") {
      continue;
    }

    const isCollapsed = collapsedIds.has(child.id);
    if (isCollapsed !== !!child.collapsed) {
      if (!isCollapsed) {
        return "expand";
      }

      isAnyCollapsed = true;
    }
  }

  return isAnyCollapsed ? "collapse" : "resize";
}
