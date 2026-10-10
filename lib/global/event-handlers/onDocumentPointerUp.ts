import { completeActivePointerResize } from "../utils/completeActivePointerResize.ts";

export function onDocumentPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  // The event is prevented if it completes a drag (even if a layout change callback throws)
  completeActivePointerResize(event.currentTarget as Document, event);
}
