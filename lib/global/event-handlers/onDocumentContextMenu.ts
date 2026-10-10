import { completeActivePointerResize } from "../utils/completeActivePointerResize.ts";

export function onDocumentContextMenu(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  // "contextmenu" events don't reliably report the pointerId of the pointer that opened the menu,
  // so only match the active drag by document
  const { clientX, clientY, movementX, movementY } = event;
  completeActivePointerResize(event.currentTarget as Document, {
    clientX,
    clientY,
    movementX,
    movementY
  });
}
