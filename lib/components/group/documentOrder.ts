/**
 * Checks whether the elements are (still) in DOM order.
 *
 * This only compares adjacent elements (N-1 comparisons) and does not read layout,
 * so it is cheap enough to run on every render.
 * Disconnected elements are treated as being in order.
 */
export function isInDocumentOrder(elements: HTMLElement[]): boolean {
  for (let index = 1; index < elements.length; index++) {
    const position = elements[index - 1].compareDocumentPosition(
      elements[index]
    );
    if (
      !(position & Node.DOCUMENT_POSITION_DISCONNECTED) &&
      position & Node.DOCUMENT_POSITION_PRECEDING
    ) {
      return false;
    }
  }

  return true;
}
