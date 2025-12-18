import type { Layout, RegisteredGroup } from "../components/group/types";
import { assert } from "../utils/assert";
import { calculateAvailableGroupSize } from "./dom/calculateAvailableGroupSize";
import { calculateHitRegions } from "./dom/calculateHitRegions";
import { calculatePanelConstraints } from "./dom/calculatePanelConstraints";
import { onGroupPointerLeave } from "./event-handlers/onGroupPointerLeave";
import { onWindowKeyDown } from "./event-handlers/onWindowKeyDown";
import { onWindowPointerDown } from "./event-handlers/onWindowPointerDown";
import { onWindowPointerMove } from "./event-handlers/onWindowPointerMove";
import { onWindowPointerUp } from "./event-handlers/onWindowPointerUp";
import { update } from "./mutableState";
import { calculateDefaultLayout } from "./utils/calculateDefaultLayout";
import { layoutsEqual } from "./utils/layoutsEqual";
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
          const groupSize = calculateAvailableGroupSize({ group });
          if (groupSize === 0) {
            // Can't calculate anything meaningful if the group has a width/height of 0
            // (This could indicate that it's within a hidden subtree)
            return;
          }

          update((prevState) => {
            const match = prevState.mountedGroups.get(group);
            if (match) {
              // Update non-percentage based constraints
              const nextDerivedPanelConstraints =
                calculatePanelConstraints(group);

              // Revalidate layout in case constraints have changed
              const prevLayout = match.defaultLayoutDeferred
                ? calculateDefaultLayout(nextDerivedPanelConstraints)
                : match.layout;
              const nextLayout = validatePanelGroupLayout({
                layout: prevLayout,
                panelConstraints: nextDerivedPanelConstraints
              });

              if (
                !match.defaultLayoutDeferred &&
                layoutsEqual(prevLayout, nextLayout)
              ) {
                return prevState;
              }

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

  const groupSize = calculateAvailableGroupSize({ group });

  // Calculate initial layout for the new Panel configuration
  const derivedPanelConstraints = calculatePanelConstraints(group);
  const panelIdsKey = group.panels.map(({ id }) => id).join(",");

  // Gracefully handle an invalid default layout
  // This could happen when e.g. useDefaultLayout is combined with dynamic Panels
  // In this case the best we can do is ignore the incoming layout
  let defaultLayout: Layout | undefined = group.defaultLayout;
  if (defaultLayout) {
    if (group.panels.length !== Object.keys(defaultLayout).length) {
      defaultLayout = undefined;
    }
  }

  const defaultLayoutUnsafe: Layout =
    group.inMemoryLayouts[panelIdsKey] ??
    defaultLayout ??
    calculateDefaultLayout(derivedPanelConstraints);
  const defaultLayoutSafe = validatePanelGroupLayout({
    layout: defaultLayoutUnsafe,
    panelConstraints: derivedPanelConstraints
  });

  const hitRegions = calculateHitRegions(group);

  const nextState = update((prevState) => ({
    mountedGroups: new Map(prevState.mountedGroups).set(group, {
      defaultLayoutDeferred: groupSize === 0,
      derivedPanelConstraints,
      layout: defaultLayoutSafe,
      separatorToPanels: new Map(
        hitRegions
          .filter((hitRegion) => hitRegion.separator)
          .map((hitRegion) => [hitRegion.separator!, hitRegion.panels])
      )
    })
  }));

  // The "pointerleave" event is not reliably triggered when the pointer exits a window or iframe
  // To account for this, we listen for "pointerleave" events on the Group element itself
  // TODO Could I listen to document.body instead of this?
  group.element.addEventListener("pointerleave", onGroupPointerLeave);

  group.separators.forEach((separator) => {
    assert(
      !separatorIds.has(separator.id),
      `Separator ids must be unique; id "${separator.id}" was used more than once`
    );

    separatorIds.add(separator.id);

    separator.element.addEventListener("keydown", onWindowKeyDown);
  });

  // If this is the first group to be mounted, initialize event handlers
  if (nextState.mountedGroups.size === 1) {
    window.addEventListener("pointerdown", onWindowPointerDown);
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
  }

  return function unmountGroup() {
    isMounted = false;

    const nextState = update((prevState) => {
      const mountedGroups = new Map(prevState.mountedGroups);
      mountedGroups.delete(group);

      return { mountedGroups };
    });

    group.element.removeEventListener("pointerleave", onGroupPointerLeave);

    group.separators.forEach((separator) => {
      separator.element.removeEventListener("keydown", onWindowKeyDown);
    });

    // If this was the last group to be mounted, tear down event handlers
    if (nextState.mountedGroups.size === 0) {
      window.removeEventListener("pointerdown", onWindowPointerDown);
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    }

    resizeObserver.disconnect();
  };
}
