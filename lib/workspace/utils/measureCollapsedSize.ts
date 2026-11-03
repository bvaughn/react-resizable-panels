import { getClientScale } from "../../global/dom/getClientScale";
import type { Orientation } from "../../global/types";

/**
 * Size (in layout pixels, along its split) that a tabset collapses to: the natural thickness of its header,
 * plus the tabset's own padding and border.
 *
 * ℹ️ While a tabset is collapsed, its header runs along its split (see TabsetSlot), so its thickness is its size in that direction;
 * while it's expanded, its header may run across the split instead (e.g. tabs on top of a tabset in a horizontal split),
 * in which case its thickness is an estimate (it's measured again once the tabset collapses).
 */
export function measureCollapsedSize(
  tabsetElement: HTMLElement,
  headerElement: HTMLElement,
  orientation: Orientation
): number {
  const isHeaderVertical =
    headerElement.dataset.tabPlacement === "left" ||
    headerElement.dataset.tabPlacement === "right";

  // The header's natural thickness is measured (rather than its current size), since the header may be stretched to fill the tabset,
  // whose size depends on this measurement (e.g. a vertical header without its own width would never grow from an initial size of 0)
  const dimension = isHeaderVertical ? "width" : "height";
  const headerStyle = headerElement.style;
  const prevFlex = headerStyle.flex;
  const prevSize = headerStyle[dimension];
  headerStyle.flex = "none";
  headerStyle[dimension] = "max-content";
  const headerRect = headerElement.getBoundingClientRect();
  headerStyle.flex = prevFlex;
  headerStyle[dimension] = prevSize;

  const thickness = isHeaderVertical
    ? headerRect.width / getClientScale(headerElement, "horizontal")
    : headerRect.height / getClientScale(headerElement, "vertical");

  const tabsetStyle =
    tabsetElement.ownerDocument.defaultView?.getComputedStyle(tabsetElement);
  const sides =
    orientation === "horizontal" ? ["left", "right"] : ["top", "bottom"];
  let edges = 0;
  for (const side of sides) {
    edges +=
      (parseFloat(tabsetStyle?.getPropertyValue(`padding-${side}`) ?? "") ||
        0) +
      (parseFloat(
        tabsetStyle?.getPropertyValue(`border-${side}-width`) ?? ""
      ) || 0);
  }

  return Math.round(thickness + edges);
}
