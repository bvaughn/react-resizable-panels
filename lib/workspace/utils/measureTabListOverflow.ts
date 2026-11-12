import { getTabListScrollport } from "./getTabListScrollport";
import { getTabListTabElements } from "./getTabListTabElements";

// Positions on screen aren't rounded to whole pixels, so tabs within a pixel of the edge of the list count as fully visible
const TOLERANCE = 1;

/**
 * Ids of a tab list's tabs that are out of view, in the order they're shown:
 * - `hidden`: tabs that are entirely out of view
 * - `hiddenOrClipped`: tabs that are at least partly out of view (cut off by an edge of the list), including the hidden ones
 */
export type TabListOverflowState = {
  hidden: string[];
  hiddenOrClipped: string[];
};

/**
 * Which of a tab list's tabs are out of view: outside of its scrollport (the list's padding box), along the list.
 *
 * ℹ️ Positions are measured on screen, so this doesn't depend on how the list is scrolled or laid out (e.g. right to left),
 * or on whether an ancestor is scaled (e.g. CSS `zoom`).
 *
 * ℹ️ Lists that are the same as the previous measurement's are reused, so they can be compared by reference
 * (e.g. so that a component that only uses one of them doesn't re-render when only the other changes).
 */
export function measureTabListOverflow(
  element: HTMLElement,
  prev?: TabListOverflowState | undefined
): TabListOverflowState {
  const isVertical = element.dataset.orientation === "vertical";

  // A list that isn't rendered (e.g. "display: none") doesn't have tabs out of view; its tabs aren't shown at all
  if (element.getClientRects().length === 0) {
    return reuse({ hidden: [], hiddenOrClipped: [] }, prev);
  }

  const scrollport = getTabListScrollport(element);

  const hidden: string[] = [];
  const hiddenOrClipped: string[] = [];
  for (const tab of getTabListTabElements(element)) {
    // Tabs that aren't rendered (e.g. "display: none") have no boxes
    if (tab.getClientRects().length === 0) {
      continue;
    }

    const tabId = tab.dataset.tabId!;

    // Every tab is out of view in a list that has no size (e.g. it's shrunk to 0px beside a toolbar)
    if (!scrollport) {
      hidden.push(tabId);
      hiddenOrClipped.push(tabId);
      continue;
    }

    const tabRect = tab.getBoundingClientRect();
    const [start, end] = isVertical
      ? [tabRect.top, tabRect.bottom]
      : [tabRect.left, tabRect.right];

    if (
      end <= scrollport.start + TOLERANCE ||
      start >= scrollport.end - TOLERANCE
    ) {
      hidden.push(tabId);
      hiddenOrClipped.push(tabId);
    } else if (
      start < scrollport.start - TOLERANCE ||
      end > scrollport.end + TOLERANCE
    ) {
      hiddenOrClipped.push(tabId);
    }
  }

  return reuse({ hidden, hiddenOrClipped }, prev);
}

function reuse(
  next: TabListOverflowState,
  prev: TabListOverflowState | undefined
): TabListOverflowState {
  return {
    hidden:
      prev && isSameIds(prev.hidden, next.hidden) ? prev.hidden : next.hidden,
    hiddenOrClipped:
      prev && isSameIds(prev.hiddenOrClipped, next.hiddenOrClipped)
        ? prev.hiddenOrClipped
        : next.hiddenOrClipped
  };
}

function isSameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}
