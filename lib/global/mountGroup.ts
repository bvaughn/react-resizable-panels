import type { RegisteredGroup } from "../components/group/types";
import { calculatePanelConstraints } from "./dom/calculatePanelConstraints";
import { calculateDefaultLayout } from "./utils/calculateDefaultLayout";
import { update } from "./mutableState";
import { onPointerDown } from "./pointer-events/onPointerDown";
import { onPointerMove } from "./pointer-events/onPointerMove";
import { onPointerUp } from "./pointer-events/onPointerUp";
import { notifyResizeHandler } from "./utils/notifyResizeHandler";
import { validatePanelGroupLayout } from "./utils/validatePanelGroupLayout";

export function mountGroup(group: RegisteredGroup) {
  let isMounted = false;

  // Add Panels with onResize callbacks to ResizeObserver
  // Add Group to o ResizeObserver also in order to sync % based constraints
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { borderBoxSize, target } = entry;
      if (target === group.element) {
        if (isMounted) {
          update((prevState) => ({
            mountedGroups: new Map(prevState.mountedGroups).set(group, {
              derivedPanelConstraints: calculatePanelConstraints(group),
              layout: defaultLayout
            })
          }));
        }
      } else {
        notifyResizeHandler(group, target as HTMLElement, borderBoxSize);
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
  let defaultLayout = calculateDefaultLayout(derivedPanelConstraints);
  defaultLayout = validatePanelGroupLayout({
    layout: defaultLayout,
    panelConstraints: derivedPanelConstraints
  });
  const nextState = update((prevState) => ({
    mountedGroups: new Map(prevState.mountedGroups).set(group, {
      derivedPanelConstraints,
      layout: defaultLayout
    })
  }));

  isMounted = true;

  // If this is the first group to be mounted, initialize event handlers
  if (nextState.mountedGroups.size === 1) {
    document.body.addEventListener("pointerdown", onPointerDown);
    document.body.addEventListener("pointerleave", onPointerMove);
    document.body.addEventListener("pointermove", onPointerMove);
    document.body.addEventListener("pointerup", onPointerUp);

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
      document.body.removeEventListener("pointerdown", onPointerDown);
      document.body.removeEventListener("pointerleave", onPointerMove);
      document.body.removeEventListener("pointermove", onPointerMove);
      document.body.removeEventListener("pointerup", onPointerUp);

      // TODO Remove keyboard event listeners
    }

    resizeObserver.disconnect();
  };
}
