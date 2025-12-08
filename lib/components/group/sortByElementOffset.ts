import type { Orientation } from "./types";

export function sortByElementOffset<
  Type extends { element: HTMLElement },
  ReturnType extends Type[]
>(orientation: Orientation, panelsOrSeparators: Type[]): ReturnType {
  return panelsOrSeparators.sort(
    orientation === "horizontal" ? horizontalSort : verticalSort
  ) as ReturnType;
}

function horizontalSort<Type extends { element: HTMLElement }>(
  a: Type,
  b: Type
) {
  const delta = a.element.offsetLeft - b.element.offsetLeft;
  if (delta !== 0) {
    return delta;
  }
  return a.element.offsetWidth - b.element.offsetWidth;
}

function verticalSort<Type extends { element: HTMLElement }>(a: Type, b: Type) {
  const delta = a.element.offsetTop - b.element.offsetTop;
  if (delta !== 0) {
    return delta;
  }
  return a.element.offsetHeight - b.element.offsetHeight;
}
