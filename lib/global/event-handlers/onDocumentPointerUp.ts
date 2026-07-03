import { completeResize } from "../utils/completeResize.ts";

export function onDocumentPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  completeResize(event, true);
}
