/**
 * Compares two elements by their position in the DOM, for use with Array.prototype.sort.
 * Disconnected elements are treated as equal.
 */
export function compareDocumentPosition(a: Node, b: Node): number {
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_DISCONNECTED) {
    return 0;
  } else if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1;
  }

  return 0;
}
