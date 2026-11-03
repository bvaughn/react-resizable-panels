import { isShadowRoot } from "../../shared/utils/isShadowRoot";
import { findTabset } from "../models/findTabset";
import type { DragSource, TabDropTarget, WorkspaceModel } from "../types";
import { getOwnElement } from "./getOwnElement";
import { getDropRegion } from "./getDropRegion";
import { getTabListIndex } from "./getTabListIndex";

export function getDropTarget({
  clientX,
  clientY,
  model,
  rootElement,
  source
}: {
  clientX: number;
  clientY: number;
  model: WorkspaceModel;
  rootElement: HTMLElement;
  source: DragSource;
}): TabDropTarget | undefined {
  // Hit test within the workspace's own root, since for a workspace in a shadow root the document only reports the shadow host
  const root = rootElement.getRootNode();
  const element = (
    isShadowRoot(root) ? root : rootElement.ownerDocument
  ).elementFromPoint(clientX, clientY);
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

  if (source.type === "tabset") {
    return getTabsetDropTarget({
      clientX,
      clientY,
      element,
      model,
      sourceTabsetId: source.tabsetId,
      tabsetElement,
      tabsetId: tabset.id
    });
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
    const isOwnTabset = tabset.tabs.some(({ id }) => id === source.tabId);

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

function getTabsetDropTarget({
  clientX,
  clientY,
  element,
  model,
  sourceTabsetId,
  tabsetElement,
  tabsetId
}: {
  clientX: number;
  clientY: number;
  element: Element;
  model: WorkspaceModel;
  sourceTabsetId: string;
  tabsetElement: HTMLElement;
  tabsetId: string;
}): TabDropTarget | undefined {
  // A tabset can't be dropped onto itself
  if (tabsetId === sourceTabsetId) {
    return undefined;
  }

  // Tabsets kept when empty can be moved, but not merged into other tabsets (which would leave them behind, empty)
  const isMoveOnly = !!findTabset(model, sourceTabsetId)?.keepWhenEmpty;

  const tabList = getOwnElement(tabsetElement, "[data-tab-list]");
  if (tabList?.contains(element)) {
    return isMoveOnly
      ? undefined
      : { index: getTabListIndex(tabList, clientX, clientY), tabsetId };
  }

  const tabPanels = getOwnElement(tabsetElement, "[data-tab-panels]");
  if (tabPanels?.contains(element)) {
    const region = getDropRegion(
      tabPanels.getBoundingClientRect(),
      clientX,
      clientY
    );

    return region === "center" && isMoveOnly ? undefined : { region, tabsetId };
  }

  return undefined;
}
