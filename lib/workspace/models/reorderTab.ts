import { copyModel } from "./copyModel";
import { findTabsetContainingTab } from "./findTabsetContainingTab";
import type { WorkspaceModel } from "../types";

/**
 * Moves a tab one place earlier (-1) or later (1) within its tab list, e.g. from the keyboard;
 * unlike moveTab, the tabset's selected tab doesn't change.
 *
 * ℹ️ The model is returned unchanged if the tab is already first (or last).
 */
export function reorderTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string,
  offset: -1 | 1
): WorkspaceModel<TabData, TabsetData> {
  const current = findTabsetContainingTab(model, tabId);
  const index = current?.tabs.findIndex(({ id }) => id === tabId) ?? -1;
  const nextIndex = index + offset;
  if (
    !current ||
    index < 0 ||
    nextIndex < 0 ||
    nextIndex >= current.tabs.length
  ) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabsetContainingTab(next, tabId);
  if (tabset) {
    const tabs = [...tabset.tabs];
    [tabs[index], tabs[nextIndex]] = [tabs[nextIndex], tabs[index]];
    tabset.tabs = tabs;
  }

  return next;
}
