import { abortActivePointerResize } from "../utils/abortActivePointerResize";

export function onWindowBlur(event: FocusEvent) {
  // Element "blur" events don't bubble, but ignore them anyway in case they are dispatched to the window
  if (event.target !== event.currentTarget) {
    return;
  }

  // Focus moved to another window or a native dialog so a "pointerup" event may never reach this document
  abortActivePointerResize((event.currentTarget as Window).document);
}
