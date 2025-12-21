// Detects ShadowRoot without requiring instanceof and browser globals
export function isShadowRoot(value: unknown): value is ShadowRoot {
  return (
    value !== null &&
    typeof value === "object" &&
    "nodeType" in value &&
    value.nodeType === Node.DOCUMENT_FRAGMENT_NODE
  );
}
