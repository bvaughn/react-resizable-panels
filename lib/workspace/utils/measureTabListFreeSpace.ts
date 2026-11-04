import { getClientScale } from "../../global/dom/getClientScale";
import { isHTMLElement } from "../../shared/utils/isHTMLElement";

/**
 * Space (in layout pixels, along the list) that a tab list's tabs don't use; negative once they overflow.
 *
 * ℹ️ The tabs' extent is measured from their positions (rather than the list's scroll size, which equals its size until it overflows),
 * so it doesn't depend on how the list is scrolled or laid out (e.g. right to left);
 * the list's border and padding and the outer margins of its first and last tabs count as used space.
 *
 * ℹ️ Positions are measured on screen (unlike offsets, they aren't rounded to whole pixels) and converted to layout pixels,
 * in case an ancestor is scaled (e.g. CSS `zoom`).
 */
export function measureTabListFreeSpace(element: HTMLElement): number {
  const isVertical = element.dataset.orientation === "vertical";
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const read = (target: CSSStyleDeclaration | undefined, property: string) =>
    parseFloat(target?.getPropertyValue(property) ?? "") || 0;

  const [startSide, endSide] = isVertical
    ? ["top", "bottom"]
    : ["left", "right"];
  const scale = getClientScale(element, isVertical ? "vertical" : "horizontal");
  const rect = element.getBoundingClientRect();

  // The space within the list's border and padding
  const size =
    (isVertical ? rect.height : rect.width) / scale -
    read(style, `border-${startSide}-width`) -
    read(style, `border-${endSide}-width`) -
    read(style, `padding-${startSide}`) -
    read(style, `padding-${endSide}`);

  let start: { element: HTMLElement; position: number } | undefined;
  let end: { element: HTMLElement; position: number } | undefined;
  for (const child of element.children) {
    // Hidden children (e.g. "display: none") take no space
    if (!isHTMLElement(child) || child.offsetParent === null) {
      continue;
    }

    const childRect = child.getBoundingClientRect();
    const childStart = isVertical ? childRect.top : childRect.left;
    const childEnd = isVertical ? childRect.bottom : childRect.right;
    if (!start || childStart < start.position) {
      start = { element: child, position: childStart };
    }
    if (!end || childEnd > end.position) {
      end = { element: child, position: childEnd };
    }
  }

  if (!start || !end) {
    return Math.round(size);
  }

  const getChildStyle = (child: HTMLElement) =>
    child.ownerDocument.defaultView?.getComputedStyle(child);
  const margins =
    read(getChildStyle(start.element), `margin-${startSide}`) +
    read(getChildStyle(end.element), `margin-${endSide}`);

  return Math.round(size - margins - (end.position - start.position) / scale);
}
