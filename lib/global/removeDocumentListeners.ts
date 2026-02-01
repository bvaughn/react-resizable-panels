import { documentReferenceCounts } from "./documentReferenceCounts";
import { onDocumentDoubleClick } from "./listeners/onDocumentDoubleClick";
import { onDocumentPointerDown } from "./listeners/onDocumentPointerDown";
import { onDocumentPointerLeave } from "./listeners/onDocumentPointerLeave";
import { onDocumentPointerMove } from "./listeners/onDocumentPointerMove";
import { onDocumentPointerOut } from "./listeners/onDocumentPointerOut";
import { onDocumentPointerUp } from "./listeners/onDocumentPointerUp";

export function removeDocumentListeners(ownerDocument: Document) {
  const count = documentReferenceCounts.get(ownerDocument) ?? 0;
  documentReferenceCounts.set(ownerDocument, Math.max(0, count - 1));
  if (!documentReferenceCounts.get(ownerDocument)) {
    ownerDocument.removeEventListener("dblclick", onDocumentDoubleClick, true);
    ownerDocument.removeEventListener(
      "pointerdown",
      onDocumentPointerDown,
      true
    );
    ownerDocument.removeEventListener("pointerleave", onDocumentPointerLeave);
    ownerDocument.removeEventListener("pointermove", onDocumentPointerMove);
    ownerDocument.removeEventListener("pointerout", onDocumentPointerOut);
    ownerDocument.removeEventListener("pointerup", onDocumentPointerUp, true);
  }
}
