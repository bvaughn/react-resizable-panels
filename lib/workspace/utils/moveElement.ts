import { supportsMoveBefore } from "./supportsMoveBefore";

/**
 * Moves an element to the end of a parent element.
 *
 * When the browser supports `moveBefore` (and both elements are in the same document), the element is moved without being removed first,
 * which preserves browser state that's tied to its place in the document (iframes aren't reloaded, playing media isn't paused, and focused elements stay focused);
 * otherwise it's moved with `appendChild` (e.g. in Safari, or when the element isn't in the document yet).
 */
export function moveElement(parent: Element, element: Element) {
  if (
    supportsMoveBefore(parent) &&
    parent.isConnected &&
    element.isConnected &&
    parent.ownerDocument === element.ownerDocument
  ) {
    try {
      parent.moveBefore(element, null);
      return;
    } catch {
      // e.g. the elements are in different shadow trees
    }
  }

  parent.appendChild(element);
}
