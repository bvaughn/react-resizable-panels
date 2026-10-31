import type { Orientation } from "../types";

/**
 * Ratio of an element's size on screen (in the units of pointer event coordinates) to its layout size (e.g. `offsetWidth`).
 *
 * ℹ️ These differ when an ancestor has CSS `zoom` or a scale transform,
 * so pointer movements must be divided by this ratio to convert them to layout pixels.
 */
export function getClientScale(element: HTMLElement, orientation: Orientation) {
  const layoutSize =
    orientation === "horizontal" ? element.offsetWidth : element.offsetHeight;
  if (layoutSize === 0) {
    return 1;
  }

  const rect = element.getBoundingClientRect();
  const clientSize = orientation === "horizontal" ? rect.width : rect.height;

  return clientSize > 0 ? clientSize / layoutSize : 1;
}
