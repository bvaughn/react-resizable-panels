import type { Direction } from "./types";

export function sortByElementOffset<Type extends { element: HTMLElement }>(
  direction: Direction,
  panelsOrResizeHandles: Type[]
): Type[] {
  return panelsOrResizeHandles.sort(
    direction === "horizontal"
      ? (a, b) => a.element.offsetLeft - b.element.offsetLeft
      : (a, b) => a.element.offsetTop - b.element.offsetTop
  );
}
