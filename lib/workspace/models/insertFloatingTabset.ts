import { normalizeCopiedModel } from "./normalizeCopiedModel";
import type { FloatingTabsetRect, TabsetNode, WorkspaceModel } from "../types";

export function insertFloatingTabset<TabData, TabsetData>(
  next: WorkspaceModel<TabData, TabsetData>,
  inserted: TabsetNode<TabData, TabsetData>,
  rect: FloatingTabsetRect
) {
  const { collapsed: _c, collapsible: _cs, size: _s, ...tabset } = inserted;
  next.floating = [...(next.floating ?? []), { ...tabset, ...rect }];
  return normalizeCopiedModel(next);
}
