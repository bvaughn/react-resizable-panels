import type { SyntheticEvent } from "react";

// Pointer events from these descendants are left to them (e.g. a close button, or an input to rename the tab)
const INTERACTIVE_SELECTOR = [
  "button",
  '[role="button"]',
  "input",
  "select",
  "textarea",
  '[contenteditable]:not([contenteditable="false"])',
  // Custom form controls (e.g. a toggle built from a div)
  ...[
    "checkbox",
    "combobox",
    "listbox",
    "radio",
    "searchbox",
    "slider",
    "spinbutton",
    "switch",
    "textbox"
  ].map((role) => `[role="${role}"]`),
  "[data-tab-ignore]"
].join(", ");

export function isFromInteractiveDescendant(
  event: SyntheticEvent<HTMLElement>
) {
  const target = event.target as Element;
  const { currentTarget } = event;

  const isWithin = (match: Element | null | undefined) =>
    !!match && match !== currentTarget && currentTarget.contains(match);

  if (isWithin(target.closest?.(INTERACTIVE_SELECTOR))) {
    return true;
  }

  // Labels of form controls (wrapping or linked by "for") activate the control
  const label = target.closest?.("label") as
    | HTMLLabelElement
    | null
    | undefined;
  return isWithin(label) && !!label?.control;
}
