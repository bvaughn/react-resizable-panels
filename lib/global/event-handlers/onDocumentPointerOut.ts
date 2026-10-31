import { isHTMLElement } from "../../shared/utils/isHTMLElement";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";

export function onDocumentPointerOut(event: PointerEvent) {
  // For some reason, "pointerout" events don't fire if the `relatedTarget` is an iframe
  // This can leave the `data-separator` attribute in an invalid state ("hover") which in turn might break styles
  // The easiest fix for this case is to reset the interaction state in this specific circumstance
  // See issues/645
  // Check the tag rather than "instanceof HTMLIFrameElement", which is false for iframes in other windows (e.g. a popup)
  const relatedTarget = event.relatedTarget;
  if (isHTMLElement(relatedTarget) && relatedTarget.localName === "iframe") {
    const interactionState = getInteractionState();
    switch (interactionState.state) {
      case "hover": {
        // Ignore pointers leaving other documents (e.g. a popup window)
        if (interactionState.ownerDocument === event.currentTarget) {
          updateInteractionState({
            cursorFlags: 0,
            state: "inactive"
          });
        }
      }
    }
  }
}
