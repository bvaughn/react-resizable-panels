import { getCopyModifierKey } from "./getCopyModifierKey";

// Whether the key that makes drags copy (see getCopyModifierKey) was held during an event (e.g. a pointer or drag event)
export function isCopyModifierPressed(
  event: Pick<MouseEvent, "altKey" | "ctrlKey">,
  ownerWindow: Window | null | undefined
) {
  return getCopyModifierKey(ownerWindow) === "Alt"
    ? event.altKey
    : event.ctrlKey;
}
