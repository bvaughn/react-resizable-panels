import type { Orientation } from "./types";

export function sortByElementOffset<Type extends { element: HTMLElement }>(
  orientation: Orientation,
  panelsOrSeparators: Type[]
): Type[] {
  return panelsOrSeparators.sort(
    orientation === "horizontal"
      ? (a, b) => a.element.offsetLeft - b.element.offsetLeft
      : (a, b) => a.element.offsetTop - b.element.offsetTop
  );
}
