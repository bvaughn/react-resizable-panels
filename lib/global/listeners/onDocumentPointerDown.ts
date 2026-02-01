import {
  groups,
  pendingTransactions,
  registerPendingTransaction,
  registerPointerDownAtPoint
} from "../../state/Root";
import { findMatchingHitRegions } from "../../utils/findMatchingHitRegions";

export function onDocumentPointerDown(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  // HitRegions are frozen from the time the pointer is pressed until it's released
  const hitRegions = findMatchingHitRegions(event, groups);
  hitRegions.forEach((hitRegion) => {
    const transaction = hitRegion.group.startLayoutTransaction(hitRegion);

    registerPendingTransaction(transaction);

    if (hitRegion.separator) {
      hitRegion.group.updateSeparatorState(hitRegion.separator, "dragging");
    }
  });

  if (pendingTransactions.length) {
    registerPointerDownAtPoint({
      x: event.clientX,
      y: event.clientY
    });

    event.preventDefault();
  }
}
