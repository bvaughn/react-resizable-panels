import { isShadowRoot } from "../../shared/utils/isShadowRoot";
import { getModelIndex } from "../models/getModelIndex";
import { isAtWorkspaceEdge } from "../models/isAtWorkspaceEdge";
import type {
  DragSource,
  TabDropTarget,
  WorkspaceDropEdge,
  WorkspaceModel
} from "../types";
import type { TabsetElementRegistry } from "./createTabsetElementRegistry";
import { getOwnElement } from "./getOwnElement";
import { getDropRegion } from "./getDropRegion";
import { getTabListIndex } from "./getTabListIndex";
import { getWorkspaceDropEdge } from "./getWorkspaceDropEdge";
import { isRightToLeft } from "./isRightToLeft";
import { toModelDropTarget } from "./toModelDropTarget";

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

  const modelIndex = getModelIndex(model);

  // Edges of the workspace take precedence over the tabsets beneath them (which still accept drops further in)
  const edge = getEdgeDropTarget({
    clientX,
    clientY,
    element,
    isExternal,
    model,
    rootElement,
    source
  });
  if (edge) {
    return { edge };
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
  const tabset =
    tabsetId !== undefined ? modelIndex.tabsetsById.get(tabsetId) : undefined;
  if (!tabsetElement || !tabset) {
    return undefined;
  }

  // While a tabset is maximized, tabs can only be dropped within it (or within floating tabsets, which are shown above it;
  // they only take center and index targets, so this can't split a tabset that's hidden)
  if (
    model.maximizedTabsetId !== undefined &&
    model.maximizedTabsetId !== tabset.id &&
    !modelIndex.floatingTabsetIds.has(tabset.id)
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
  // so it's only targeted as a whole (which also keeps the tabset itself, e.g. its id and data);
  // floating tabsets can't be split at all, so tabs dropped anywhere on their content are added to them
  const isSplittable =
    (tabset.tabs.length > 0 || !!tabset.keepWhenEmpty) &&
    !modelIndex.floatingTabsetIds.has(tabset.id);

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

function getEdgeDropTarget({
  clientX,
  clientY,
  element,
  isExternal,
  model,
  rootElement,
  source
}: {
  clientX: number;
  clientY: number;
  element: Element;
  isExternal: boolean;
  model: WorkspaceModel;
  rootElement: HTMLElement;
  source: DragSource;
}): WorkspaceDropEdge | undefined {
  // While a tabset is maximized, tabs can only be dropped within it (or within floating tabsets);
  // and the edges of a root tabset (e.g. of an empty workspace) are already its own edge regions
  if (model.maximizedTabsetId !== undefined || model.root.type !== "split") {
    return undefined;
  }

  // Floating tabsets cover the layout (and its edges) beneath them
  if (isWithinOwnFloatingTabset(element, rootElement)) {
    return undefined;
  }

  const layoutElement = getLayoutElement(rootElement);
  const edge = layoutElement
    ? getWorkspaceDropEdge({
        clientX,
        clientY,
        element,
        layoutElement,
        rootElement
      })
    : undefined;
  if (!edge || isExternal) {
    return edge;
  }

  // Moving a tabset (or a tabset's only tab) to an edge it already fills would leave the layout unchanged;
  // edges are sides of the screen, so they're converted to the model's order first (see toModelDropTarget)
  const modelTarget = toModelDropTarget({ edge }, isRightToLeft(rootElement));
  const modelEdge = "edge" in modelTarget ? modelTarget.edge : edge;
  const modelIndex = getModelIndex(model);
  const sourceTabset =
    source.type === "tabset"
      ? modelIndex.tabsetsById.get(source.tabsetId)
      : modelIndex.tabsetsByTabId.get(source.tabId);
  if (
    sourceTabset &&
    (source.type === "tabset" ||
      (sourceTabset.tabs.length === 1 && !sourceTabset.keepWhenEmpty)) &&
    isAtWorkspaceEdge(model.root, sourceTabset, modelEdge)
  ) {
    return undefined;
  }

  return edge;
}

// Floating tabsets of other workspaces (e.g. one rendered within a tab) are part of those tabs' content
function isWithinOwnFloatingTabset(element: Element, rootElement: HTMLElement) {
  // Walk outward, since a workspace nested within a floating tabset may have floating tabsets of its own
  let floating = element.closest("[data-floating-tabset]");
  while (floating) {
    if (floating.closest("[data-workspace]") === rootElement) {
      return true;
    }

    floating =
      floating.parentElement?.closest("[data-floating-tabset]") ?? null;
  }

  return false;
}

// The workspace's own layout (rather than that of a workspace nested within it)
function getLayoutElement(rootElement: HTMLElement) {
  return Array.from(rootElement.children).find((child): child is HTMLElement =>
    child.hasAttribute("data-workspace-layout")
  );
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
