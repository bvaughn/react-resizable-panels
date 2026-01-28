import type { Layout, RegisteredGroup } from "../../components/group/types";
import { read, update } from "../mutableState";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";

export function onDocumentPointerDown(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  const { mountedGroups } = read();

  const hitRegions = findMatchingHitRegions(event, mountedGroups);

  const initialLayoutMap = new Map<RegisteredGroup, Layout>();

  let didChangeFocus = false;

  hitRegions.forEach((current) => {
    if (current.separator) {
      if (!didChangeFocus) {
        didChangeFocus = true;

        current.separator.element.focus();
      }
    }

    const match = mountedGroups.get(current.group);
    if (match) {
      initialLayoutMap.set(current.group, match.layout);
    }
  });

  update({
    interactionState: {
      hitRegions,
      initialLayoutMap,
      pointerDownAtPoint: { x: event.clientX, y: event.clientY },
      state: "active"
    }
  });

  if (hitRegions.length) {
    event.preventDefault();
  }
}
