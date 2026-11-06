import { copyModel } from "./copyModel";
import { createTabset } from "./createTabset";
import { findTabset } from "./findTabset";
import { findTabsetContainingTab } from "./findTabsetContainingTab";
import { insertAtDropTarget } from "./insertAtDropTarget";
import { removeTab } from "./removeTab";
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

  let insertTarget = target;
  if ("index" in target || target.region === "center") {
    if (source === destination) {
      // Removing the tab shifts the tabs after it
      let index =
        "index" in target
          ? Math.max(0, Math.min(target.index, destination.tabs.length))
          : destination.tabs.length;
      if (index > sourceIndex) {
        index--;
      }

      if (index === sourceIndex && destination.selectedId === tabId) {
        return model;
      }

      insertTarget = { index, tabsetId: destination.id };
    }
  } else if (
    // Splitting a tabset with its only tab would leave the layout unchanged (unless the tabset is kept when empty)
    source === destination &&
    source.tabs.length === 1 &&
    !source.keepWhenEmpty
  ) {
    return model;
  }

  removeTab(source, tabId);

  // A tab dropped in from another tabset is selected, so a collapsed tabset expands to show it (like when one of its tabs is clicked);
  // reordering the tabs of a collapsed tabset leaves it collapsed
  return insertAtDropTarget(
    next,
    destination,
    createTabset([tab]),
    insertTarget,
    {
      expandCollapsedDestination: source !== destination
    }
  );
}
