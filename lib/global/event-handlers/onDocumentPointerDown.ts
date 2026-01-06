import type { Layout, RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredSeparator } from "../../components/separator/types";
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

  const groups = new Set<RegisteredGroup>();
  const panels = new Set<RegisteredPanel>();
  const separators = new Set<RegisteredSeparator>();
  const initialLayoutMap = new Map<RegisteredGroup, Layout>();

  let didChangeFocus = false;

  hitRegions.forEach((current) => {
    groups.add(current.group);
    current.panels.forEach((panel) => {
      panels.add(panel);
    });

    if (current.separator) {
      separators.add(current.separator);

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
