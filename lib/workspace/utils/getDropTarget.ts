import { isShadowRoot } from "../../shared/utils/isShadowRoot";
import { getModelIndex } from "../models/getModelIndex";
import type { DragSource, TabDropTarget, WorkspaceModel } from "../types";
import type { TabsetElementRegistry } from "./createTabsetElementRegistry";
import { getOwnElement } from "./getOwnElement";
import { getDropRegion } from "./getDropRegion";
import { getTabListIndex } from "./getTabListIndex";

export function getDropTarget({
  clientX,
  clientY,
  isExternal = false,
  model,
  rootElement,
  source,
  tabsetElements
}: {
  clientX: number;
  clientY: number;
  /** Set if the source is in another workspace, so its ids don't refer to nodes of this one's model (and the nodes' own tabsets don't apply) */
  isExternal?: boolean;
  model: WorkspaceModel;
  rootElement: HTMLElement;
  source: DragSource;
  /** The workspace's tabset elements; tabsets that aren't registered are searched for their elements instead */
  tabsetElements?: TabsetElementRegistry | undefined;
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
  const modelIndex = getModelIndex(model);
  const tabset =
    tabsetId !== undefined ? modelIndex.tabsetsById.get(tabsetId) : undefined;
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

  // The tabset's own list and panels (rather than those of a tabset nested within it)
  const registered = tabsetElements?.get(tabset.id);
  const { tabList, tabPanels } =
    registered?.tabset === tabsetElement
      ? { tabList: registered.tabList, tabPanels: registered.panels }
      : {
          tabList: getOwnElement(tabsetElement, "[data-tab-list]"),
          tabPanels: getOwnElement(tabsetElement, "[data-tab-panels]")
        };

  // Splitting an empty tabset would remove it (unless it's kept when empty), leaving the dropped tab(s) in its place,
  // so it's only targeted as a whole (which also keeps the tabset itself, e.g. its id and data)
  const isSplittable = tabset.tabs.length > 0 || !!tabset.keepWhenEmpty;

  if (source.type === "tabset") {
    return getTabsetDropTarget({
      clientX,
      clientY,
      element,
      isExternal,
      isMoveOnly:
        !isExternal &&
        !!modelIndex.tabsetsById.get(source.tabsetId)?.keepWhenEmpty,
      isSplittable,
      sourceTabsetId: source.tabsetId,
      tabList,
      tabPanels,
      tabsetId: tabset.id
    });
  }

  if (tabList?.contains(element)) {
    return {
      index: getTabListIndex(tabList, clientX, clientY),
      tabsetId: tabset.id
    };
  }

  if (tabPanels?.contains(element)) {
    const isOwnTabset =
      !isExternal && tabset.tabs.some(({ id }) => id === source.tabId);

    // Splitting a tabset with its only tab would leave the layout unchanged (unless the tabset is kept when empty)
    const canSplit =
      isSplittable &&
      (!!tabset.keepWhenEmpty || !(tabset.tabs.length === 1 && isOwnTabset));
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
  isExternal,
  isMoveOnly,
  isSplittable,
  sourceTabsetId,
  tabList,
  tabPanels,
  tabsetId
}: {
  clientX: number;
  clientY: number;
  element: Element;
  isExternal: boolean;
  /** Tabsets kept when empty can be moved, but not merged into other tabsets (which would leave them behind, empty);
   * those of other workspaces aren't moved at all (see isExternalDropDisabled) */
  isMoveOnly: boolean;
  isSplittable: boolean;
  sourceTabsetId: string;
  tabList: HTMLElement | null | undefined;
  tabPanels: HTMLElement | null | undefined;
  tabsetId: string;
}): TabDropTarget | undefined {
  // A tabset can't be dropped onto itself
  if (!isExternal && tabsetId === sourceTabsetId) {
    return undefined;
  }

  if (tabList?.contains(element)) {
    return isMoveOnly
      ? undefined
      : { index: getTabListIndex(tabList, clientX, clientY), tabsetId };
  }

  if (tabPanels?.contains(element)) {
    const region = isSplittable
      ? getDropRegion(tabPanels.getBoundingClientRect(), clientX, clientY)
      : "center";

    return region === "center" && isMoveOnly ? undefined : { region, tabsetId };
  }

  return undefined;
}
