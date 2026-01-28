import { pendingTransactions } from "../../state/Root";

export function onDocumentPointerLeave(event: PointerEvent) {
  if (pendingTransactions.length) {
    // TODO Update active resize
  }
}
