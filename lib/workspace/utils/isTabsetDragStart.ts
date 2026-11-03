import { isHeaderEmptySpace } from "./isHeaderEmptySpace";

// Whether a press within a tabset's header should drag the tabset:
// a press on a drag handle (an element with a "data-tabset-drag-handle" attribute) if the header has one,
// otherwise a press on the header's empty space (the header or its tab list, rather than a tab or the toolbar's content)
export function isTabsetDragStart(header: HTMLElement, target: Element) {
  // Handles within another workspace (e.g. one rendered within the toolbar) belong to its tabsets
  const handles = Array.from(
    header.querySelectorAll("[data-tabset-drag-handle]")
  ).filter((handle) => handle.closest("[data-tabset-header]") === header);
  if (handles.length > 0) {
    return handles.some((handle) => handle.contains(target));
  }

  return isHeaderEmptySpace(header, target);
}
