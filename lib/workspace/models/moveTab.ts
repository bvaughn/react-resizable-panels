import { copyModel } from "./copyModel";
import { createTabset } from "./createTabset";
import { findTabset } from "./findTabset";
import { findTabsetContainingTab } from "./findTabsetContainingTab";
import { normalizeModel } from "./normalizeModel";
import { removeTab } from "./removeTab";
import { splitTabset } from "./splitTabset";
import type { TabDropTarget, WorkspaceModel } from "../types";

export function moveTab<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabId: string,
  target: TabDropTarget
): WorkspaceModel<TabData, TabsetData> {
  const next = copyModel(model);
  const source = findTabsetContainingTab(next, tabId);
  const destination = findTabset(next, target.tabsetId);
  if (!source || !destination) {
    return model;
  }

  const sourceIndex = source.tabs.findIndex(({ id }) => id === tabId);
  const tab = source.tabs[sourceIndex];

  if ("index" in target || target.region === "center") {
    let index =
      "index" in target
        ? Math.max(0, Math.min(target.index, destination.tabs.length))
        : destination.tabs.length;

    if (source === destination) {
      // Removing the tab shifts the tabs after it
      if (index > sourceIndex) {
        index--;
      }

      if (index === sourceIndex && destination.selectedId === tabId) {
        return model;
      }
    }

    removeTab(source, tabId);
    destination.tabs.splice(index, 0, tab);
    destination.selectedId = tab.id;
  } else {
    // Splitting a tabset with its only tab would leave the layout unchanged (unless the tabset is kept when empty)
    if (
      source === destination &&
      source.tabs.length === 1 &&
      !source.keepWhenEmpty
    ) {
      return model;
    }

    removeTab(source, tabId);
    next.root = splitTabset(
      next.root,
      destination,
      createTabset([tab]),
      target.region
    );

    // A maximized tabset that's split is no longer maximized
    if (next.maximizedTabsetId === destination.id) {
      next.maximizedTabsetId = undefined;
    }
  }

  return normalizeModel(next);
}
