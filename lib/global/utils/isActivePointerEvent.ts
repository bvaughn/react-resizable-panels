import type { InteractionActive } from "../mutable-state/types";

// Interaction state is shared by every document with mounted groups (e.g. a main window and a popup)
// Only events for the pointer that started a drag, in the document it started in, should affect that drag
export function isActivePointerEvent(
  interactionState: InteractionActive,
  ownerDocument: Document,
  pointerId: number | undefined
) {
  return (
    interactionState.ownerDocument === ownerDocument &&
    (pointerId === undefined || pointerId === interactionState.pointerId)
  );
}
