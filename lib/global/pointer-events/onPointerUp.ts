import { update } from "../mutableState";

export function onPointerUp(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  event.preventDefault();

  update((prevState) =>
    prevState.interactionState.state === "inactive"
      ? prevState
      : {
          interactionState: {
            state: "inactive"
          }
        }
  );

  // TODO Update global cursor
}
