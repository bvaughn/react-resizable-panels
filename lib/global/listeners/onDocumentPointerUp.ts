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
    pendingTransactions.slice().forEach((transaction) => {
      if (transaction.hitRegion && transaction.hitRegion.separator) {
        transaction.hitRegion.group.updateSeparatorState(
          transaction.hitRegion.separator,
          "default"
        );
      }

      transaction.endTransaction();
    });

    event.preventDefault();
  }
}
