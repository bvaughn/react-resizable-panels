import { EventEmitter } from "../../utils/EventEmitter";
import type { InteractionState } from "./types";

let state: InteractionState = {
  cursorFlags: 0,
  state: "inactive"
};

type ChangeEvent = {
  next: InteractionState;
  prev: InteractionState;
};

const eventEmitter = new EventEmitter<{
  change: ChangeEvent;
}>();

export function getInteractionState() {
  return state;
}

export function subscribeToInteractionState(
  callback: (event: ChangeEvent) => void
) {
  return eventEmitter.addListener("change", callback);
}

export function updateCursorFlags(cursorFlags: number) {
  const prev = state;

  const next = { ...state };
  next.cursorFlags = cursorFlags;

  state = next;

  eventEmitter.emit("change", {
    prev,
    next
  });
}

export function updateInteractionState(next: InteractionState) {
  const prev = state;

  state = next;

  eventEmitter.emit("change", {
    prev,
    next
  });
}
