import type { InteractionActive } from "../mutable-state/types";

type Pointer = {
  pointerId?: number | undefined;
  pointerType?: string | undefined;
};

export function isSamePointer(
  interactionState: InteractionActive,
  { pointerId, pointerType }: Pointer
) {
  return (
    pointerId === interactionState.pointerId ||
    // There is only one pen, but it may be assigned a new pointerId each time it comes into range
    (pointerType === "pen" && interactionState.pointerType === "pen")
  );
}

// Interaction state is shared by every document with mounted groups (e.g. a main window and a popup)
// Only events for the pointer that started a drag, in the document it started in, should affect that drag
// Events without a pointerId (e.g. window "blur") match any pointer
export function isActivePointerEvent(
  interactionState: InteractionActive,
  ownerDocument: Document,
  pointer: Pointer = {}
) {
  return (
    interactionState.ownerDocument === ownerDocument &&
    (pointer.pointerId === undefined ||
      isSamePointer(interactionState, pointer))
  );
}
