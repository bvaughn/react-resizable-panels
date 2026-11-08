import { copyModel } from "./copyModel";
import { findParent } from "./findParent";
import { findTabset } from "./findTabset";
import { isFloatingTabset } from "./isFloatingTabset";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import type {
  FloatingTabsetNode,
  FloatingTabsetRect,
  WorkspaceModel
} from "../types";

/**
 * Moves a tabset out of the layout, to float above it on top of any other floating tabsets (see WorkspaceModel.floating);
 * siblings share the space it leaves (see normalizeModel).
 *
 * ℹ️ The root tabset (which fills the workspace) and tabsets that are already floating are left unchanged.
 */
export function floatTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string,
  rect: FloatingTabsetRect
): WorkspaceModel<TabData, TabsetData> {
  const current = findTabset(model, tabsetId);
  if (!current || isFloatingTabset(model, current)) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabset(next, tabsetId);
  const parent = findParent(next.root, tabsetId);
  if (!tabset || !parent) {
    return model;
  }

  parent.children.splice(parent.children.indexOf(tabset), 1);

  // A collapsed tabset floats expanded (it can be collapsed again; see FloatingTabsetNode)
  const { collapsed: _c, collapsible: _cs, size: _s, ...rest } = tabset;
  const floating: FloatingTabsetNode<TabData, TabsetData> = {
    ...rest,
    ...rect
  };
  next.floating = [...(next.floating ?? []), floating];

  // A maximized tabset is restored first (floating tabsets can't be maximized)
  if (next.maximizedTabsetId === tabsetId) {
    delete next.maximizedTabsetId;
  }

  return normalizeCopiedModel(next);
}
