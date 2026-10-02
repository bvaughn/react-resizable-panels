import { compareDocumentPosition } from "./compareDocumentPosition";

/**
 * Returns a copy of the elements sorted by their position in the DOM.
 */
export function sortByDocumentPosition(elements: HTMLElement[]): HTMLElement[] {
  return Array.from(elements).sort(compareDocumentPosition);
}
