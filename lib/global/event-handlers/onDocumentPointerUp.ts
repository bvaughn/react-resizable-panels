import { completeActivePointerResize } from "../utils/completeActivePointerResize.ts";

export function onDocumentPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  const matched = completeActivePointerResize(event.currentTarget as Document);
  if (matched) {
    event.preventDefault();
  }
}
