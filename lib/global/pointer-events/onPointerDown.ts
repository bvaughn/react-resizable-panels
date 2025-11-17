import type { Layout, RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredResizeHandle } from "../../components/resize-handle/types";
import { read, update } from "../mutableState";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";

export function onPointerDown(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const { mountedGroups } = read();

  const hitRegions = findMatchingHitRegions(event, mountedGroups);

  const groups = new Set<RegisteredGroup>();
  const panels = new Set<RegisteredPanel>();
  const resizeHandles = new Set<RegisteredResizeHandle>();
  const initialLayoutMap = new Map<RegisteredGroup, Layout>();

  hitRegions.forEach((current) => {
    groups.add(current.group);
    current.panels.forEach((panel) => {
      panels.add(panel);
    });
    if (current.resizeHandle) {
      resizeHandles.add(current.resizeHandle);
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
