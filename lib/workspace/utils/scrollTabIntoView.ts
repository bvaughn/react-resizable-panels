import { getTabListScrollport } from "./getTabListScrollport";

/**
 * Scrolls a tab list (and only the tab list, unlike `Element.scrollIntoView`) the least it can to show the whole tab,
 * or its start if the tab is longer than the list.
 *
 * ℹ️ The distance is measured on screen and scrolled by (rather than to a position),
 * so it doesn't depend on how the list is laid out (e.g. right to left, where scroll positions are negative).
 * The list's `scroll-behavior` (e.g. "smooth") applies.
 *
 * @returns `false` if the list has no size (so it can't be scrolled yet), otherwise `true`
 */
export function scrollTabIntoView(
  list: HTMLElement,
  tab: HTMLElement
): boolean {
  const isVertical = list.dataset.orientation === "vertical";

  const scrollport = getTabListScrollport(list);
  if (!scrollport) {
    return false;
  }

  // Elements can't be scrolled in some environments (e.g. jsdom)
  if (typeof list.scrollBy !== "function") {
    return true;
  }

  const tabRect = tab.getBoundingClientRect();
  const [start, end] = isVertical
    ? [tabRect.top, tabRect.bottom]
    : [tabRect.left, tabRect.right];

  let delta = 0;
  if (start < scrollport.start) {
    delta = start - scrollport.start;
  } else if (end > scrollport.end) {
    delta = Math.min(end - scrollport.end, start - scrollport.start);
  }

  // Less than a pixel isn't worth scrolling (positions on screen aren't rounded to whole pixels)
  if (Math.abs(delta) < 1) {
    return true;
  }

  // Scroll offsets are in layout pixels
  list.scrollBy(
    isVertical
      ? { top: delta / scrollport.scale }
      : { left: delta / scrollport.scale }
  );
  return true;
}
