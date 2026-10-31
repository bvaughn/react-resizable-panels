import type { SyntheticEvent } from "react";

// Pointer and keyboard events from these descendants are left to them (e.g. a close button)
const INTERACTIVE_SELECTOR = 'button, [role="button"], [data-tab-ignore]';

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
