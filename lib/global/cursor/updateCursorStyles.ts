import type { InteractionState } from "../mutable-state/types";
import { updateCursorStyle } from "./updateCursorStyle";

function getOwnerDocument(interactionState: InteractionState) {
  return interactionState.state === "inactive"
    ? undefined
    : interactionState.ownerDocument;
}

// Interaction state is shared by every document with mounted groups (e.g. a main window and a popup)
// so the cursor must be updated in the document the previous state belonged to, as well as the next one
export function updateCursorStyles({
  next,
  prev
}: {
  next: InteractionState;
  prev: InteractionState;
}) {
  const prevDocument = getOwnerDocument(prev);
  const nextDocument = getOwnerDocument(next);

  if (prevDocument && prevDocument !== nextDocument) {
    updateCursorStyle(prevDocument);
  }
  if (nextDocument) {
    updateCursorStyle(nextDocument);
  }
}
