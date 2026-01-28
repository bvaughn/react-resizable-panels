import {
  pendingTransactions,
  registerPointerDownAtPoint
} from "../../state/Root";

export function onDocumentPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  registerPointerDownAtPoint(null);

  if (pendingTransactions.length) {
    pendingTransactions.forEach((transaction) => {
      transaction.endTransaction();
    });

    event.preventDefault();
  }
}
