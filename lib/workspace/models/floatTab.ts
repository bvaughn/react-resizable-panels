import { copyModel } from "./copyModel";
import { createTabset } from "./createTabset";
import { findTabsetContainingTab } from "./findTabsetContainingTab";
import { isFloatingTabset } from "./isFloatingTabset";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import { removeTab } from "./removeTab";
import type {
  FloatingTabsetNode,
  FloatingTabsetRect,
  WorkspaceModel
} from "../types";

/**
 * Moves a tab into a new floating tabset, on top of any other floating tabsets (see WorkspaceModel.floating);
 * like a tab dropped onto the edge of a tabset, the new tabset doesn't inherit its old tabset's data or flags.
 *
 * ℹ️ The only tab of a floating tabset (that isn't kept when empty) is left where it is, since moving it would leave the model unchanged.
 */
export function floatTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string,
  rect: FloatingTabsetRect
): WorkspaceModel<TabData, TabsetData> {
  const current = findTabsetContainingTab(model, tabId);
  if (
    !current ||
    (isFloatingTabset(model, current) &&
      current.tabs.length === 1 &&
      !current.keepWhenEmpty)
  ) {
    return model;
  }

  const next = copyModel(model);
  const source = findTabsetContainingTab(next, tabId);
  const tab = source?.tabs.find(({ id }) => id === tabId);
  if (!source || !tab) {
    return model;
  }

  removeTab(source, tabId);

  const { size: _, ...tabset } = createTabset<TabData, TabsetData>([tab]);
  const floating: FloatingTabsetNode<TabData, TabsetData> = {
    ...tabset,
    ...rect
  };
  next.floating = [...(next.floating ?? []), floating];

  return normalizeCopiedModel(next);
}
