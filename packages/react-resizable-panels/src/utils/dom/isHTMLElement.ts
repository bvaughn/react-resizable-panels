export function isHTMLElement(target: unknown): target is HTMLElement {
  if (target instanceof HTMLElement) {
    return true;
  }

  // Fallback to duck typing to handle edge case of portals within a popup window
  return (
    typeof target === "object" &&
    target !== null &&
    "tagName" in target &&
    "getAttribute" in target
  );
}
