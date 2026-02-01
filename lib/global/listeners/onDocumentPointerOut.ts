import { groups, pendingTransactions } from "../../state/Root";

// For some reason, "pointerout" events don't fire if the `relatedTarget` is an iframe
// This can leave the `data-separator` attribute in an invalid state ("hover") which in turn might break styles
// The easiest fix for this case is to reset the interaction state in this specific circumstance
// See issues/645
export function onDocumentPointerOut(event: PointerEvent) {
  if (pendingTransactions.length > 0) {
    // Skip if a resize operation is active
    // Users should be able to drag out and back in (provided the pointer isn't released)
    return;
  }

  if (event.relatedTarget instanceof HTMLIFrameElement) {
    groups.forEach((group) => {
      group.separators.forEach((separator) => {
        group.updateSeparatorState(separator, "default");
      });
    });
  }
}
