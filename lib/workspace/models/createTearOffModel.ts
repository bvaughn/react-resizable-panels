import { copyStructure } from "./copyStructure";
import { createId } from "./createId";
import { findTab } from "./findTab";
import { findTabset } from "./findTabset";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import type {
  DragSource,
  FloatingTabsetRect,
  TabsetNode,
  WorkspaceModel
} from "../types";

/**
 * Creates a model containing only a torn off tab or tabset (see the Workspace's `onTearOff` prop), e.g. for a workspace in a popup window.
 *
 * A torn off tab is put in a new tabset, like a tab dropped onto the edge of a tabset (so it doesn't inherit its old tabset's data or flags);
 * a torn off tabset keeps its id, data, and flags, but not its size, position, or collapsed state.
 */
export function createTearOffModel<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  source: DragSource
): WorkspaceModel<TabData, TabsetData> | undefined {
  let root: TabsetNode<TabData, TabsetData>;
  if (source.type === "tab") {
    const tab = findTab(model, source.tabId);
    if (!tab) {
      return undefined;
    }

    root = {
      id: createId(),
      selectedId: tab.id,
      tabs: [{ ...tab }],
      type: "tabset"
    };
  } else {
    const tabset = findTabset(model, source.tabsetId);
    if (!tabset) {
      return undefined;
    }

    // A floating tabset's position and size don't apply either
    const {
      height: _h,
      width: _w,
      x: _x,
      y: _y,
      ...copy
    } = copyStructure(tabset) as TabsetNode<TabData, TabsetData> &
      Partial<FloatingTabsetRect>;
    root = copy;
    delete root.collapsed;
    delete root.size;
  }

  return normalizeCopiedModel({ root, version: 1 });
}
