import type { Direction } from "./types";

export function sortByElementOffset<Type extends { element: HTMLElement }>(
  direction: Direction,
  panelsOrSeparators: Type[]
): Type[] {
  return panelsOrSeparators.sort(
    direction === "horizontal"
      ? (a, b) => a.element.offsetLeft - b.element.offsetLeft
      : (a, b) => a.element.offsetTop - b.element.offsetTop
  );
}
