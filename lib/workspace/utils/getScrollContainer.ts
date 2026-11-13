import type { Orientation } from "../../global/types";
import { isHTMLElement } from "../../shared/utils/isHTMLElement";

/**
 * The element that an element scrolls within along an orientation: its nearest ancestor that scrolls (has overflow to scroll),
 * or the document's scrolling element.
 */
export function getScrollContainer(
  element: HTMLElement,
  orientation: Orientation
): Element | null {
  const isVertical = orientation === "vertical";
  const ownerWindow = element.ownerDocument.defaultView;

  for (
    let current = element.parentElement;
    current && current !== element.ownerDocument.body;
    current = current.parentElement
  ) {
    if (!isHTMLElement(current)) {
      continue;
    }

    const style = ownerWindow?.getComputedStyle(current);
    const overflow = isVertical ? style?.overflowY : style?.overflowX;
    const isScrollable =
      (overflow === "auto" ||
        overflow === "scroll" ||
        overflow === "overlay") &&
      (isVertical
        ? current.scrollHeight > current.offsetHeight
        : current.scrollWidth > current.offsetWidth);
    if (isScrollable) {
      return current;
    }
  }

  return element.ownerDocument.scrollingElement;
}
