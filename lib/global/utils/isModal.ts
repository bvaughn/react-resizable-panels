export function isModal(element: Element) {
  try {
    return element.matches(":modal");
  } catch {
    // The ":modal" pseudo-class is not supported by all environments (e.g. older browsers, JSDom)
    return false;
  }
}
