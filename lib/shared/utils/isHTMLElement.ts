// Detects HTMLElement without requiring instanceof and browser globals
export function isHTMLElement(value: unknown): value is HTMLElement {
  return (
    value !== null &&
    typeof value === "object" &&
    "nodeType" in value &&
    value.nodeType === Node.ELEMENT_NODE
  );
}
