import type { Layout, RegisteredGroup } from "../components/group/types";
import { calculatePanelConstraints } from "./dom/calculatePanelConstraints";
import { update } from "./mutableState";
import { onPointerDown } from "./pointer-events/onPointerDown";
import { onPointerMove } from "./pointer-events/onPointerMove";
import { onPointerUp } from "./pointer-events/onPointerUp";
import { calculateDefaultLayout } from "./utils/calculateDefaultLayout";
import { notifySeparator } from "./utils/notifySeparator";
import { validatePanelGroupLayout } from "./utils/validatePanelGroupLayout";

export function mountGroup(group: RegisteredGroup) {
  let isMounted = false;

  // Add Panels with onResize callbacks to ResizeObserver
  // Add Group to ResizeObserver also in order to sync % based constraints
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { borderBoxSize, target } = entry;
      if (target === group.element) {
        if (isMounted) {
          update((prevState) => {
            const match = prevState.mountedGroups.get(group);
            if (match) {
              return {
                mountedGroups: new Map(prevState.mountedGroups).set(group, {
                  derivedPanelConstraints: calculatePanelConstraints(group),
                  layout: match.layout
                })
              };
            }
            return prevState;
          });
        }
      } else {
        notifySeparator(group, target as HTMLElement, borderBoxSize);
      }
    }
  });
  resizeObserver.observe(group.element);
  group.panels.forEach((panel) => {
    if (panel.onResize) {
      resizeObserver.observe(panel.element);
    }
  });

  // Calculate initial layout for the new Panel configuration
  const derivedPanelConstraints = calculatePanelConstraints(group);
  const panelIdsKey = group.panels.map(({ id }) => id).join(",");

  const defaultLayoutUnsafe: Layout =
    group.inMemoryLayouts[panelIdsKey] ??
    group.defaultLayout ??
    calculateDefaultLayout(derivedPanelConstraints);
  const defaultLayoutSafe = validatePanelGroupLayout({
    layout: defaultLayoutUnsafe,
    panelConstraints: derivedPanelConstraints
  });

  const nextState = update((prevState) => ({
    mountedGroups: new Map(prevState.mountedGroups).set(group, {
      derivedPanelConstraints,
      layout: defaultLayoutSafe
    })
  }));

  isMounted = true;

  // If this is the first group to be mounted, initialize event handlers
  if (nextState.mountedGroups.size === 1) {
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerleave", onPointerMove);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // TODO Add keyboard event listeners
  }

  return function unmountGroup() {
    const nextState = update((prevState) => {
      const mountedGroups = new Map(prevState.mountedGroups);
      mountedGroups.delete(group);

      return { mountedGroups };
    });

    isMounted = false;

    // If this was the last group to be mounted, tear down event handlers
    if (nextState.mountedGroups.size === 0) {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerleave", onPointerMove);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      // TODO Remove keyboard event listeners
    }

    resizeObserver.disconnect();
  };
}
