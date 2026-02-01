import type { Orientation } from "../types";

export function sortByElementOffset(
  orientation: Orientation,
  children: HTMLElement[]
): HTMLElement[] {
  return children.sort(
    orientation === "horizontal" ? horizontalSort : verticalSort
  );
}

function horizontalSort(a: HTMLElement, b: HTMLElement) {
  const delta = a.offsetLeft - b.offsetLeft;
  if (delta !== 0) {
    return delta;
  }
  return a.offsetWidth - b.offsetWidth;
}

function verticalSort(a: HTMLElement, b: HTMLElement) {
  const delta = a.offsetTop - b.offsetTop;
  if (delta !== 0) {
    return delta;
  }
  return a.offsetHeight - b.offsetHeight;
}
