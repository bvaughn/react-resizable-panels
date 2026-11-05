import { getClientScale } from "../../global/dom/getClientScale";
import { isHTMLElement } from "../../shared/utils/isHTMLElement";
import { getLayoutChildren } from "./getLayoutChildren";

/**
 * Space (in layout pixels, along the list) that a tab list's tabs don't use; negative once they overflow.
 *
 * ℹ️ The tabs' extent is measured from their positions (rather than the list's scroll size, which equals its size until it overflows),
 * so it doesn't depend on how the list is scrolled or laid out (e.g. right to left);
 * the list's border and padding and the outer margins of its first and last tabs count as used space.
 *
 * ℹ️ The list's header (its parent) can overflow too, once the list can't shrink any further
 * (e.g. it's 0px wide, next to a toolbar that doesn't shrink); the list doesn't change size then, so the header's overflow is subtracted.
 * Only the header's children on the same line as the list count (e.g. not a toolbar below it, in a header that stacks or wraps them).
 * While the header doesn't overflow, this is the same as the list's size less its tabs' extent.
 *
 * ℹ️ Positions are measured on screen (unlike offsets, they aren't rounded to whole pixels) and converted to layout pixels,
 * in case an ancestor is scaled (e.g. CSS `zoom`).
 */
export function measureTabListFreeSpace(element: HTMLElement): number {
  const isVertical = element.dataset.orientation === "vertical";
  const header = element.parentElement;

  // The scale can't be measured from a list that's 0px wide, so it's measured from the header when there is one
  const scale = getClientScale(
    header && isHTMLElement(header) ? header : element,
    isVertical ? "vertical" : "horizontal"
  );

  // Hidden tabs (e.g. "display: none") take no space
  const tabs = Array.from(element.children).filter(
    (child): child is HTMLElement =>
      isHTMLElement(child) && child.offsetParent !== null
  );
  const list = measureContent(element, tabs, isVertical, scale);

  let headerOverflow = 0;
  if (header) {
    // Children overlapping the list across its axis; a list that's 0px wide still has a height (or width, if it's vertical).
    // A list without one (e.g. an empty tabset's, in a header that doesn't stretch it) is a point on its line.
    const listRect = element.getBoundingClientRect();
    const [lineStart, lineEnd] = isVertical
      ? [listRect.left, listRect.right]
      : [listRect.top, listRect.bottom];
    const children = getLayoutChildren(header).filter((child) => {
      if (child === element) {
        return true;
      }

      const rect = child.getBoundingClientRect();
      const [start, end] = isVertical
        ? [rect.left, rect.right]
        : [rect.top, rect.bottom];
      return lineEnd > lineStart
        ? start < lineEnd && end > lineStart
        : start <= lineStart && end >= lineStart;
    });
    headerOverflow = Math.max(
      0,
      -measureContent(header, children, isVertical, scale)
    );
  }

  return Math.round(list - headerOverflow);
}

// The space within an element's border and padding, less the extent of the given children (from the outer margin of the first to that of the last)
function measureContent(
  element: Element,
  children: HTMLElement[],
  isVertical: boolean,
  scale: number
): number {
  const getStyle = (target: Element) =>
    target.ownerDocument.defaultView?.getComputedStyle(target);
  const read = (target: CSSStyleDeclaration | undefined, property: string) =>
    parseFloat(target?.getPropertyValue(property) ?? "") || 0;

  const [startSide, endSide] = isVertical
    ? ["top", "bottom"]
    : ["left", "right"];
  const style = getStyle(element);
  const rect = element.getBoundingClientRect();

  const size =
    (isVertical ? rect.height : rect.width) / scale -
    read(style, `border-${startSide}-width`) -
    read(style, `border-${endSide}-width`) -
    read(style, `padding-${startSide}`) -
    read(style, `padding-${endSide}`);

  let start: { element: HTMLElement; position: number } | undefined;
  let end: { element: HTMLElement; position: number } | undefined;
  for (const child of children) {
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
    return size;
  }

  const margins =
    read(getStyle(start.element), `margin-${startSide}`) +
    read(getStyle(end.element), `margin-${endSide}`);

  return size - margins - (end.position - start.position) / scale;
}
