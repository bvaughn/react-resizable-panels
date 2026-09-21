import type { Orientation } from "./types";

export function sortByElementOffset<
  Type extends { element: HTMLElement },
  ReturnType extends Type[]
>(orientation: Orientation, panelsOrSeparators: Type[]): ReturnType {
  return Array.from(panelsOrSeparators).sort((a, b) => {
    const delta =
      orientation === "horizontal" ? horizontalSort(a, b) : verticalSort(a, b);
    if (delta !== 0) {
      return delta;
    }

    // JSDom and hidden elements may have identical offsets and sizes.
    // Use DOM order so registration order does not affect panel adjacency.
    const position = a.element.compareDocumentPosition(b.element);
    if (position & Node.DOCUMENT_POSITION_DISCONNECTED) {
      return 0;
    }
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }

    return 0;
  }) as ReturnType;
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
