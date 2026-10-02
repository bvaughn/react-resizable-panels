/**
 * Returns a copy of the elements sorted by their position in the DOM.
 */
export function sortByDocumentPosition(elements: HTMLElement[]): HTMLElement[] {
  return Array.from(elements).sort((a, b) => {
    const position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_DISCONNECTED) {
      return 0;
    } else if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }

    return 0;
  });
}
