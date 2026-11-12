import { getClientScale } from "../../global/dom/getClientScale";

/**
 * The part of a tab list that shows its tabs (its scrollport: the list within its border), along the list, in screen pixels;
 * and the ratio of screen pixels to layout pixels (e.g. scroll offsets), which differ when an ancestor is scaled (e.g. CSS `zoom`).
 *
 * ℹ️ Tab lists don't usually show scrollbars; a scrollbar along the list isn't excluded.
 *
 * @returns The scrollport, or `undefined` if the list has no size
 */
export function getTabListScrollport(
  list: HTMLElement
): { end: number; scale: number; start: number } | undefined {
  const isVertical = list.dataset.orientation === "vertical";

  const layoutSize = isVertical ? list.offsetHeight : list.offsetWidth;
  if (layoutSize === 0) {
    return undefined;
  }

  const rect = list.getBoundingClientRect();
  const scale = getClientScale(list, isVertical ? "vertical" : "horizontal");

  const style = list.ownerDocument.defaultView?.getComputedStyle(list);
  const read = (property: string) =>
    (parseFloat(style?.getPropertyValue(property) ?? "") || 0) * scale;
  const [startSide, endSide] = isVertical
    ? ["top", "bottom"]
    : ["left", "right"];

  return {
    end:
      (isVertical ? rect.bottom : rect.right) - read(`border-${endSide}-width`),
    scale,
    start:
      (isVertical ? rect.top : rect.left) + read(`border-${startSide}-width`)
  };
}
