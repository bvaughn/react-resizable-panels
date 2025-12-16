import { updateCursorStyle } from "../cursor/updateCursorStyle";
import { read, update } from "../mutableState";
import { onGroupPointerLeave } from "./onGroupPointerLeave";

export function onWindowPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  event.preventDefault();

  const { interactionState } = read();

  switch (interactionState.state) {
    case "active": {
      interactionState.hitRegions.forEach((hitRegion) => {
        hitRegion.group.element.removeEventListener(
          "pointerleave",
          onGroupPointerLeave
        );
      });

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
