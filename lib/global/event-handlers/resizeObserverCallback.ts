import type { RegisteredGroup } from "../../components/group/types";
import { calculateAvailableGroupSize } from "../dom/calculateAvailableGroupSize";
import { calculatePanelConstraints } from "../dom/calculatePanelConstraints";
import {
  getMountedGroupState,
  updateMountedGroup
} from "../mutable-state/groups";
import { calculateDefaultLayout } from "../utils/calculateDefaultLayout";
import { layoutsEqual } from "../utils/layoutsEqual";
import { notifyPanelOnResize } from "../utils/notifyPanelOnResize";
import { objectsEqual } from "../utils/objectsEqual";
import { preserveFixedPanelSizes } from "../utils/preserveFixedPanelSizes";
import { validatePanelGroupLayout } from "../utils/validatePanelGroupLayout";

export function resizeObserverCallback({
  group,
  target
}: {
  group: RegisteredGroup;
  target: Element;
}) {
  const ownerDocument = target.ownerDocument;

  const groupState = getMountedGroupState(group.id);
  if (!groupState) {
    return;
  }

  const pendingResizeEventsForElements = new Set(
    groupState.pendingResizeEventsForElements
  );

  switch (ownerDocument.visibilityState) {
    case "hidden": {
      // Ignore ResizeObserver updates when hidden; see #731
      pendingResizeEventsForElements.add(target);

      updateMountedGroup({
        group,
        partial: { pendingResizeEventsForElements }
      });
      return;
    }
    case "visible": {
      pendingResizeEventsForElements.delete(target);
    }
  }

  if (target === group.element) {
    const groupSize = calculateAvailableGroupSize({ group });
    if (groupSize === 0) {
      // Can't calculate anything meaningful if the group has a width/height of 0
      // (This could indicate that it's within a hidden subtree)
      return;
    }

    // Update non-percentage based constraints
    const nextDerivedPanelConstraints = calculatePanelConstraints(group);

    // Revalidate layout in case constraints have changed or group size changed
    const prevLayout = groupState.defaultLayoutDeferred
      ? calculateDefaultLayout(nextDerivedPanelConstraints)
      : groupState.layout;
    const unsafeLayout = preserveFixedPanelSizes({
      group,
      nextGroupSize: groupSize,
      prevGroupSize: groupState.groupSize,
      prevLayout
    });
    const nextLayout = validatePanelGroupLayout({
      layout: unsafeLayout,
      panelConstraints: nextDerivedPanelConstraints
    });

    if (
      !groupState.defaultLayoutDeferred &&
      layoutsEqual(groupState.layout, nextLayout) &&
      objectsEqual(
        groupState.derivedPanelConstraints,
        nextDerivedPanelConstraints
      ) &&
      groupState.groupSize === groupSize
    ) {
      return;
    }

    updateMountedGroup({
      group,
      state: {
        defaultLayoutDeferred: false,
        derivedPanelConstraints: nextDerivedPanelConstraints,
        groupSize,
        layout: nextLayout,
        pendingResizeEventsForElements,
        separatorToPanels: groupState.separatorToPanels
      }
    });
  } else {
    notifyPanelOnResize(group, target as HTMLElement);
  }
}
