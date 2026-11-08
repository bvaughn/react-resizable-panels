import { copyModel } from "./copyModel";
import { findTabset } from "./findTabset";
import { isFloatingTabset } from "./isFloatingTabset";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import type { WorkspaceImperativeHandle, WorkspaceModel } from "../types";

export function updateTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string,
  changes: Parameters<
    WorkspaceImperativeHandle<TabData, TabsetData>["updateTabset"]
  >[1]
): WorkspaceModel<TabData, TabsetData> {
  if (!findTabset(model, tabsetId)) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabset(next, tabsetId);
  if (tabset) {
    // Positions and sizes only apply to floating tabsets (and collapsible flags only to tabsets in the layout; see normalizeFloatingTabset)
    if (isFloatingTabset(next, tabset)) {
      Object.assign(tabset, changes);
    } else {
      const { height: _h, width: _w, x: _x, y: _y, ...rest } = changes;
      Object.assign(tabset, rest);
    }
  }

  // Turning off keepWhenEmpty may leave an empty tabset to remove
  return normalizeCopiedModel(next);
}
