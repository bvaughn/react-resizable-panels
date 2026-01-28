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

  const hitRegions = findMatchingHitRegions(event, groups);
  hitRegions.forEach((hitRegion) => {
    const transaction = hitRegion.group.startLayoutTransaction(
      hitRegion.panels.map((panel) => hitRegion.group.panels.indexOf(panel))
    );
    registerPendingTransaction(transaction);
  });

  if (pendingTransactions.length) {
    registerPointerDownAtPoint({
      x: event.clientX,
      y: event.clientY
    });

    event.preventDefault();
  }
}
