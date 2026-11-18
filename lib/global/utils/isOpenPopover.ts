export function isOpenPopover(element: Element) {
  try {
    return element.matches(":popover-open");
  } catch {
    // The ":popover-open" pseudo-class is not supported by all environments (e.g. older browsers, JSDom)
    return false;
  }
}
