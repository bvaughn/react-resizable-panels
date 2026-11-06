import { getClientScale } from "../../global/dom/getClientScale";
import type { TabDropRegion } from "../types";

export type DropIndicatorInsets = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

/**
 * Insets (in layout pixels) that position the drop indicator over a region of a tabset's panels,
 * within the element it's positioned in (which covers the workspace's root element).
 *
 * ℹ️ Every region sets all four insets, so that changes between regions and tabsets can be animated (e.g. "transition: inset 250ms").
 */
export function measureDropIndicatorInsets(
  containerElement: HTMLElement,
  panelsElement: HTMLElement,
  region: TabDropRegion
): DropIndicatorInsets {
  const containerRect = containerElement.getBoundingClientRect();
  const panelsRect = panelsElement.getBoundingClientRect();

  // Converted to layout pixels, which differ from client pixels when an ancestor has CSS zoom or a scale transform
  const scaleX = getClientScale(containerElement, "horizontal");
  const scaleY = getClientScale(containerElement, "vertical");

  let left = (panelsRect.left - containerRect.left) / scaleX;
  let top = (panelsRect.top - containerRect.top) / scaleY;
  let width = panelsRect.width / scaleX;
  let height = panelsRect.height / scaleY;

  switch (region) {
    case "bottom": {
      height /= 2;
      top += height;
      break;
    }
    case "left": {
      width /= 2;
      break;
    }
    case "right": {
      width /= 2;
      left += width;
      break;
    }
    case "top": {
      height /= 2;
      break;
    }
  }

  return {
    bottom: containerRect.height / scaleY - top - height,
    left,
    right: containerRect.width / scaleX - left - width,
    top
  };
}
