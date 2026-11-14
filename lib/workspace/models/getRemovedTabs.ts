import { getModelIndex } from "./getModelIndex";
import type { TabNode, WorkspaceModel } from "../types";

/**
 * The tabs in a model that aren't in the next one (e.g. tabs that a change closes), in the order they were found.
 */
export function getRemovedTabs<TabData, TabsetData>(
  prev: WorkspaceModel<TabData, TabsetData>,
  next: WorkspaceModel<TabData, TabsetData>
): TabNode<TabData>[] {
  const nextTabsById = getModelIndex(next).tabsById;
  const removed: TabNode<TabData>[] = [];
  for (const [id, tab] of getModelIndex(prev).tabsById) {
    if (!nextTabsById.has(id)) {
      removed.push(tab as TabNode<TabData>);
    }
  }

  return removed;
}
