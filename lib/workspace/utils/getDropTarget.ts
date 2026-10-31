import { findTabset } from "../models/findTabset";
import type { TabDropTarget, WorkspaceModel } from "../types";
import { getOwnElement } from "./getOwnElement";
import { getDropRegion } from "./getDropRegion";
import { getTabListIndex } from "./getTabListIndex";

export function getDropTarget({
  clientX,
  clientY,
  model,
  rootElement,
  tabId
}: {
  clientX: number;
  clientY: number;
  model: WorkspaceModel;
  rootElement: HTMLElement;
  tabId: string;
}): TabDropTarget | undefined {
  const element = rootElement.ownerDocument.elementFromPoint(clientX, clientY);
  if (!element || !rootElement.contains(element)) {
    return undefined;
  }

  // Skip tabsets of other workspaces (e.g. one rendered within a tab)
  let tabsetElement = element.closest<HTMLElement>("[data-tabset-id]");
  while (
    tabsetElement &&
    tabsetElement.closest("[data-workspace]") !== rootElement
  ) {
    tabsetElement =
      tabsetElement.parentElement?.closest<HTMLElement>("[data-tabset-id]") ??
      null;
  }

  const tabsetId = tabsetElement?.dataset.tabsetId;
  const tabset = findTabset(model, tabsetId);
  if (!tabsetElement || !tabset) {
    return undefined;
  }

  // While a tabset is maximized, tabs can only be dropped within it
  if (
    model.maximizedTabsetId !== undefined &&
    model.maximizedTabsetId !== tabset.id
  ) {
    return undefined;
  }

  const tabList = getOwnElement(tabsetElement, "[data-tab-list]");
  if (tabList?.contains(element)) {
    return {
      index: getTabListIndex(tabList, clientX, clientY),
      tabsetId: tabset.id
    };
  }

  const tabPanels = getOwnElement(tabsetElement, "[data-tab-panels]");
  if (tabPanels?.contains(element)) {
    const isOwnTabset = tabset.tabs.some(({ id }) => id === tabId);

    // Splitting a tabset with its only tab would leave the layout unchanged (unless the tabset is kept when empty)
    const canSplit =
      !!tabset.keepWhenEmpty || !(tabset.tabs.length === 1 && isOwnTabset);
    const region = canSplit
      ? getDropRegion(tabPanels.getBoundingClientRect(), clientX, clientY)
      : "center";

    // Dropping a tab onto the center of its own tabset would only move it to the end of the list
    if (region === "center" && isOwnTabset) {
      return undefined;
    }

    return { region, tabsetId: tabset.id };
  }

  // Other parts of a tabset (e.g. buttons in its header) don't accept drops
  return undefined;
}
