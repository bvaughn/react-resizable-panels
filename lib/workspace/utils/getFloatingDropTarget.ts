import { getClientScale } from "../../global/dom/getClientScale";
import { isShadowRoot } from "../../shared/utils/isShadowRoot";
import { getModelIndex } from "../models/getModelIndex";
import type { FloatingTabsetRect } from "../types";
import { getDefaultFloatingRect } from "./getDefaultFloatingRect";
import type { DropTargetOptions } from "./getDropTarget";

export function getFloatingDropTarget({
  clientX,
  clientY,
  isExternal,
  model,
  rootElement,
  source,
  tabsetElements
}: DropTargetOptions): { float: FloatingTabsetRect } | undefined {
  const root = rootElement.getRootNode();
  const element = (
    isShadowRoot(root) ? root : rootElement.ownerDocument
  ).elementFromPoint(clientX, clientY);
  if (element?.closest("[data-workspace]") !== rootElement) return;
  const layout = rootElement.querySelector<HTMLElement>(
    ":scope > [data-workspace-layout]"
  );
  if (!layout) return;
  const layoutRect = layout.getBoundingClientRect();
  if (
    clientX < layoutRect.left ||
    clientX > layoutRect.right ||
    clientY < layoutRect.top ||
    clientY > layoutRect.bottom
  )
    return;

  const index = getModelIndex(model);
  const tabset = isExternal
    ? undefined
    : source.type === "tab"
      ? index.tabsetsByTabId.get(source.tabId)
      : index.tabsetsById.get(source.tabsetId);
  if (
    !isExternal &&
    (!tabset ||
      (source.type === "tabset" &&
        (tabset === model.root || index.floatingTabsetIds.has(tabset.id))) ||
      (source.type === "tab" &&
        index.floatingTabsetIds.has(tabset.id) &&
        tabset.tabs.length === 1 &&
        !tabset.keepWhenEmpty))
  )
    return;

  const rect = getDefaultFloatingRect(
    layout,
    tabset && tabsetElements?.get(tabset.id)?.tabset
  );
  const x =
    (clientX - layoutRect.left) / getClientScale(layout, "horizontal") -
    rect.width / 2;
  const y =
    (clientY - layoutRect.top) / getClientScale(layout, "vertical") - 16;
  return {
    float: {
      ...rect,
      x: Math.max(0, Math.min(x, layout.offsetWidth - rect.width)),
      y: Math.max(0, Math.min(y, layout.offsetHeight - rect.height))
    }
  };
}
