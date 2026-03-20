import type { Layout, RegisteredGroup } from "../../components/group/types";
import { getMountedGroups } from "../mutable-state/groups";
import { updateInteractionState } from "../mutable-state/interactions";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";

export function onDocumentPointerDown(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  const mountedGroups = getMountedGroups();

  const hitRegions = findMatchingHitRegions(event, mountedGroups);

  const initialLayoutMap = new Map<RegisteredGroup, Layout>();

  let didChangeFocus = false;

  hitRegions.forEach((current) => {
    if (current.separator) {
      if (!didChangeFocus) {
        didChangeFocus = true;

        current.separator.element.focus({
          preventScroll: true
        });

        // TRICKY
        // Calling setPointerCapture() here would help with detecting pointer "pointermove"/"pointerup" events that happen over iframes
        // but it would also prevent "click" events from firing if the use releases without actually dragging
        // Because of this, it's safer to wait until the first "pointermove" event to set capture
      }
    }

    const match = mountedGroups.get(current.group);
    if (match) {
      initialLayoutMap.set(current.group, match.layout);
    }
  });

  updateInteractionState({
    cursorFlags: 0,
    hitRegions,
    initialLayoutMap,
    pointerDownAtPoint: { x: event.clientX, y: event.clientY },
    state: "active"
  });

  if (hitRegions.length) {
    event.preventDefault();
  }
}
