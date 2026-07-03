import { completeResize } from "../utils/completeResize.ts";

export function onDocumentContextMenu(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  completeResize(event, false);
}
