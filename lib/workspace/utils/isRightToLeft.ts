// Whether an element is laid out right to left (e.g. within dir="rtl");
// the direction is read from its computed style (which is inherited) rather than the document's, since only part of a page may be right to left
export function isRightToLeft(element: Element | null | undefined) {
  return (
    element?.ownerDocument.defaultView?.getComputedStyle(element).direction ===
    "rtl"
  );
}
