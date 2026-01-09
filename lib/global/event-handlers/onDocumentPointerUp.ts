import { updateCursorStyle } from "../cursor/updateCursorStyle";
import { read, update } from "../mutableState";

export function onDocumentPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  const { interactionState } = read();

  switch (interactionState.state) {
    case "active": {
      update({
        cursorFlags: 0,
        interactionState: {
          state: "inactive"
        }
      });

      if (interactionState.hitRegions.length > 0) {
        updateCursorStyle(event.currentTarget as Document);

        event.preventDefault();
      }
    }
  }
}
