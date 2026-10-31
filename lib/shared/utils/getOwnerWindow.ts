// Returns the window that owns the element (e.g. a popout or iframe), falling back to the global window
export function getOwnerWindow(element: Element): Window {
  return element.ownerDocument.defaultView ?? window;
}
