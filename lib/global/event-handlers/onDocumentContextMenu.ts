import { completeActivePointerResize } from "../utils/completeActivePointerResize.ts";

export function onDocumentContextMenu(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  completeActivePointerResize(event.currentTarget as Document);
}
