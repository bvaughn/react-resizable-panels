import { onWindowPointerMove } from "./onWindowPointerMove";

export function onGroupPointerLeave(event: PointerEvent) {
  // The "pointerleave" event is not reliably triggered when the pointer exits a window or iframe
  // To account for this, we listen for "pointerleave" events on the Group element itself
  // The easiest way to handle these is to reuse the same logic as the Window "pointermove" event
  onWindowPointerMove(event);
}
