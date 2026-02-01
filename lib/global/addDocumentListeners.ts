import { documentReferenceCounts } from "./documentReferenceCounts";
import { onDocumentDoubleClick } from "./listeners/onDocumentDoubleClick";
import { onDocumentPointerDown } from "./listeners/onDocumentPointerDown";
import { onDocumentPointerLeave } from "./listeners/onDocumentPointerLeave";
import { onDocumentPointerMove } from "./listeners/onDocumentPointerMove";
import { onDocumentPointerOut } from "./listeners/onDocumentPointerOut";
import { onDocumentPointerUp } from "./listeners/onDocumentPointerUp";

export function addDocumentListeners(ownerDocument: Document) {
  const count = documentReferenceCounts.get(ownerDocument) ?? 0;
  if (count === 0) {
    ownerDocument.addEventListener("dblclick", onDocumentDoubleClick, true);
    ownerDocument.addEventListener("pointerdown", onDocumentPointerDown, true);
    ownerDocument.addEventListener("pointerleave", onDocumentPointerLeave);
    ownerDocument.addEventListener("pointermove", onDocumentPointerMove);
    ownerDocument.addEventListener("pointerout", onDocumentPointerOut);
    ownerDocument.addEventListener("pointerup", onDocumentPointerUp, true);

    documentReferenceCounts.set(ownerDocument, 1);
  } else {
    documentReferenceCounts.set(ownerDocument, count + 1);
  }
}
