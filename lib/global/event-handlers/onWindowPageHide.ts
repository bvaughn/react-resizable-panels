import { abortActivePointerResize } from "../utils/abortActivePointerResize";

export function onWindowPageHide(event: PageTransitionEvent) {
  // The window was closed or navigated away (or its iframe was removed) so this document will receive no more events
  // Pointer events from other documents are ignored by the active drag, so it must be ended here or it would never end
  abortActivePointerResize((event.currentTarget as Window).document);
}
