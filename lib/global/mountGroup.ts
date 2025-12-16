import type { Layout, RegisteredGroup } from "../components/group/types";
import { assert } from "../utils/assert";
import { calculateHitRegions } from "./dom/calculateHitRegions";
import { calculatePanelConstraints } from "./dom/calculatePanelConstraints";
import { onKeyDown } from "./event-handlers/onKeyDown";
import { onPointerDown } from "./event-handlers/onPointerDown";
import { onPointerMove } from "./event-handlers/onPointerMove";
import { onPointerUp } from "./event-handlers/onPointerUp";
import { update } from "./mutableState";
import { calculateDefaultLayout } from "./utils/calculateDefaultLayout";
import { notifyPanelOnResize } from "./utils/notifyPanelOnResize";
import { validatePanelGroupLayout } from "./utils/validatePanelGroupLayout";

export function mountGroup(group: RegisteredGroup) {
  let isMounted = true;

  // Invariants
  assert(
    group.separators.length === 0 ||
      group.separators.length < group.panels.length,
    "Invalid Group configuration; too many Separator components"
  );

  const panelIds = new Set<string>();
  const separatorIds = new Set<string>();

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
              // Update non-percentage based constraints
              const nextDerivedPanelConstraints =
                calculatePanelConstraints(group);

              // Revalidate layout in case constraints have changed
              const prevLayout = match.layout;
              const nextLayout = validatePanelGroupLayout({
                layout: prevLayout,
                panelConstraints: nextDerivedPanelConstraints
              });

              return {
                mountedGroups: new Map(prevState.mountedGroups).set(group, {
                  derivedPanelConstraints: nextDerivedPanelConstraints,
                  layout: nextLayout,
                  separatorToPanels: match.separatorToPanels
                })
              };
            }
            return prevState;
          });
        }
      } else {
        notifyPanelOnResize(group, target as HTMLElement, borderBoxSize);
      }
    }
  });
  resizeObserver.observe(group.element);
  group.panels.forEach((panel) => {
    assert(
      !panelIds.has(panel.id),
      `Panel ids must be unique; id "${panel.id}" was used more than once`
    );

    panelIds.add(panel.id);

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

  const hitRegions = calculateHitRegions(group);

  const nextState = update((prevState) => ({
    mountedGroups: new Map(prevState.mountedGroups).set(group, {
      derivedPanelConstraints,
      layout: defaultLayoutSafe,
      separatorToPanels: new Map(
        hitRegions
          .filter((hitRegion) => hitRegion.separator)
          .map((hitRegion) => [hitRegion.separator!, hitRegion.panels])
      )
    })
  }));

  group.separators.forEach((separator) => {
    assert(
      !separatorIds.has(separator.id),
      `Separator ids must be unique; id "${separator.id}" was used more than once`
    );

    separatorIds.add(separator.id);

    separator.element.addEventListener("keydown", onKeyDown);
  });

  // If this is the first group to be mounted, initialize event handlers
  if (nextState.mountedGroups.size === 1) {
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerleave", onPointerMove);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  return function unmountGroup() {
    isMounted = false;

    const nextState = update((prevState) => {
      const mountedGroups = new Map(prevState.mountedGroups);
      mountedGroups.delete(group);

      return { mountedGroups };
    });

    group.separators.forEach((separator) => {
      separator.element.removeEventListener("keydown", onKeyDown);
    });

    // If this was the last group to be mounted, tear down event handlers
    if (nextState.mountedGroups.size === 0) {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerleave", onPointerMove);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }

    resizeObserver.disconnect();
  };
}
