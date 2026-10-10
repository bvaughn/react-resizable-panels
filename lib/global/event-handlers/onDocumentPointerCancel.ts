import { abortActivePointerResize } from "../utils/abortActivePointerResize";

export function onDocumentPointerCancel(event: PointerEvent) {
  // The browser has taken over the pointer (e.g. a system gesture) so no "pointerup" will follow
  // "pointercancel" coordinates are unreliable, so commit the most recent layout instead
  abortActivePointerResize(event.currentTarget as Document, event);
}
