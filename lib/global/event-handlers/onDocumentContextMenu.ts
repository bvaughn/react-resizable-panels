import { completeActivePointerResize } from "../utils/completeActivePointerResize.ts";

export function onDocumentContextMenu(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  completeActivePointerResize({
    document: event.currentTarget as Document,
    event
  });
}
