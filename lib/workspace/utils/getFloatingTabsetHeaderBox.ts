import { getClientScale } from "../../global/dom/getClientScale";
import type { FloatingHeaderBox } from "./clampFloatingPosition";
import { getOwnElement } from "./getOwnElement";

/**
 * Where a floating tabset's header is within the element that positions it (see FloatingTabsets), in the layout's pixels,
 * or `undefined` if it can't be measured (e.g. it hasn't been rendered).
 */
export function getFloatingTabsetHeaderBox(
  frame: HTMLElement
): FloatingHeaderBox | undefined {
  // The floating tabset is the first tabset within the element; others are nested within it (e.g. in a workspace rendered within a tab)
  const tabsetElement = frame.querySelector<HTMLElement>("[data-tabset-id]");
  const header = tabsetElement
    ? getOwnElement(tabsetElement, "[data-tabset-header]")
    : undefined;
  if (!header) {
    return undefined;
  }

  const scaleX = getClientScale(frame, "horizontal");
  const scaleY = getClientScale(frame, "vertical");
  const frameRect = frame.getBoundingClientRect();
  const headerRect = header.getBoundingClientRect();

  return {
    height: headerRect.height / scaleY,
    left: (headerRect.left - frameRect.left) / scaleX,
    top: (headerRect.top - frameRect.top) / scaleY,
    width: headerRect.width / scaleX
  };
}
