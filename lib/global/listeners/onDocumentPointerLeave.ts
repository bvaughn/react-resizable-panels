import { pendingTransactions } from "../../state/Root";
import { onDocumentPointerMove } from "./onDocumentPointerMove";

export function onDocumentPointerLeave(event: PointerEvent) {
  if (pendingTransactions.length) {
    // Resize pending groups to reflect the cursor's final position
    onDocumentPointerMove(event);
  }
}
