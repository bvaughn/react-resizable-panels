import type { SyntheticEvent } from "react";

// Pointer and keyboard events from these descendants are left to them (e.g. a close button, or an input to rename the tab)
const INTERACTIVE_SELECTOR = [
  "button",
  '[role="button"]',
  "input",
  "select",
  "textarea",
  '[contenteditable]:not([contenteditable="false"])',
  "[data-tab-ignore]"
].join(", ");

export function isFromInteractiveDescendant(
  event: SyntheticEvent<HTMLElement>
) {
  const match = (event.target as Element).closest?.(INTERACTIVE_SELECTOR);

  return (
    !!match &&
    match !== event.currentTarget &&
    event.currentTarget.contains(match)
  );
}
