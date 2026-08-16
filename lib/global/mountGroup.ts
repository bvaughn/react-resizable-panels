import type { Layout, RegisteredGroup } from "../components/group/types";
import { assert } from "../utils/assert";
import { calculateAvailableGroupSize } from "./dom/calculateAvailableGroupSize";
import { calculateHitRegions } from "./dom/calculateHitRegions";
import { calculatePanelConstraints } from "./dom/calculatePanelConstraints";
import { onDocumentContextMenu } from "./event-handlers/onDocumentContextMenu";
import { onDocumentDoubleClick } from "./event-handlers/onDocumentDoubleClick";
import { onDocumentKeyDown } from "./event-handlers/onDocumentKeyDown";
import { onDocumentPointerDown } from "./event-handlers/onDocumentPointerDown";
import { onDocumentPointerLeave } from "./event-handlers/onDocumentPointerLeave";
import { onDocumentPointerMove } from "./event-handlers/onDocumentPointerMove";
import { onDocumentPointerOut } from "./event-handlers/onDocumentPointerOut";
import { onDocumentPointerUp } from "./event-handlers/onDocumentPointerUp";
import { onDocumentVisibilityChange } from "./event-handlers/onDocumentVisibilityChange";
import { resizeObserverCallback } from "./event-handlers/resizeObserverCallback";
import { deleteMutableGroup, updateMountedGroup } from "./mutable-state/groups";
import type { SeparatorToPanelsMap } from "./mutable-state/types";
import { calculateDefaultLayout } from "./utils/calculateDefaultLayout";
import { validateLayoutKeys } from "./utils/validateLayoutKeys";
import { validatePanelGroupLayout } from "./utils/validatePanelGroupLayout";

const ownerDocumentReferenceCounts = new Map<Document, number>();

export function mountGroup(group: RegisteredGroup) {
  let isMounted = true;

  assert(
    group.element.ownerDocument.defaultView,
    "Cannot register an unmounted Group"
  );

  const ResizeObserver = group.element.ownerDocument.defaultView.ResizeObserver;

  const panelIds = new Set<string>();
  const separatorIds = new Set<string>();

  // Add Panels with onResize callbacks to ResizeObserver
  // Add Group to ResizeObserver also in order to sync % based constraints
  const resizeObserver = new ResizeObserver((entries) => {
    if (!isMounted) {
      return;
    }

    for (const entry of entries) {
      const { target } = entry;

      resizeObserverCallback({
        group,
        target
      });
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
  let defaultLayout: Layout | undefined = group.mutableState.defaultLayout;
  if (defaultLayout) {
    if (!validateLayoutKeys(group.panels, defaultLayout)) {
      defaultLayout = undefined;
    }
  }

  const defaultLayoutUnsafe: Layout =
    group.mutableState.layouts[panelIdsKey] ??
    defaultLayout ??
    calculateDefaultLayout(derivedPanelConstraints);
  const defaultLayoutSafe = validatePanelGroupLayout({
    layout: defaultLayoutUnsafe,
    panelConstraints: derivedPanelConstraints
  });

  const ownerDocument = group.element.ownerDocument;

  ownerDocumentReferenceCounts.set(
    ownerDocument,
    (ownerDocumentReferenceCounts.get(ownerDocument) ?? 0) + 1
  );

  const separatorToPanels: SeparatorToPanelsMap = new Map();
  const hitRegions = calculateHitRegions(group);
  hitRegions.forEach((hitRegion) => {
    if (hitRegion.separator) {
      separatorToPanels.set(hitRegion.separator, hitRegion.panels);
    }
  });

  updateMountedGroup({
    group,
    partial: {
      defaultLayoutDeferred: groupSize === 0,
      derivedPanelConstraints,
      groupSize,
      pendingResizeEventsForElements: new Set(),
      layout: defaultLayoutSafe,
      separatorToPanels
    }
  });

  group.separators.forEach((separator) => {
    assert(
      !separatorIds.has(separator.id),
      `Separator ids must be unique; id "${separator.id}" was used more than once`
    );

    separatorIds.add(separator.id);

    separator.element.addEventListener("keydown", onDocumentKeyDown);
  });

  // If this is the first group to be mounted, initialize event handlers
  if (ownerDocumentReferenceCounts.get(ownerDocument) === 1) {
    ownerDocument.addEventListener("contextmenu", onDocumentContextMenu, true);
    ownerDocument.addEventListener("dblclick", onDocumentDoubleClick, true);
    ownerDocument.addEventListener("pointerdown", onDocumentPointerDown, true);
    ownerDocument.addEventListener("pointerleave", onDocumentPointerLeave);
    ownerDocument.addEventListener("pointermove", onDocumentPointerMove);
    ownerDocument.addEventListener("pointerout", onDocumentPointerOut);
    ownerDocument.addEventListener("pointerup", onDocumentPointerUp, true);
    ownerDocument.addEventListener(
      "visibilitychange",
      onDocumentVisibilityChange
    );
  }

  return function unmountGroup() {
    isMounted = false;

    ownerDocumentReferenceCounts.set(
      ownerDocument,
      Math.max(0, (ownerDocumentReferenceCounts.get(ownerDocument) ?? 0) - 1)
    );

    deleteMutableGroup(group);

    group.separators.forEach((separator) => {
      separator.element.removeEventListener("keydown", onDocumentKeyDown);
    });

    // If this was the last group to be mounted, tear down event handlers
    if (!ownerDocumentReferenceCounts.get(ownerDocument)) {
      ownerDocument.removeEventListener(
        "contextmenu",
        onDocumentContextMenu,
        true
      );
      ownerDocument.removeEventListener(
        "dblclick",
        onDocumentDoubleClick,
        true
      );
      ownerDocument.removeEventListener(
        "pointerdown",
        onDocumentPointerDown,
        true
      );
      ownerDocument.removeEventListener("pointerleave", onDocumentPointerLeave);
      ownerDocument.removeEventListener("pointermove", onDocumentPointerMove);
      ownerDocument.removeEventListener("pointerout", onDocumentPointerOut);
      ownerDocument.removeEventListener("pointerup", onDocumentPointerUp, true);
      ownerDocument.removeEventListener(
        "onvisibilitychange",
        onDocumentVisibilityChange
      );
    }

    resizeObserver.disconnect();
  };
}
