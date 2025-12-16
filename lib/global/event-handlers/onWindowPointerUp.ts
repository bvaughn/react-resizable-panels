import { updateCursorStyle } from "../cursor/updateCursorStyle";
import { read, update } from "../mutableState";

export function onWindowPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  event.preventDefault();

  const { interactionState } = read();

  switch (interactionState.state) {
    case "active": {
      update({
        cursorFlags: 0,
        interactionState: {
          state: "inactive"
        }
      });

      updateCursorStyle();
    }
  }
}
