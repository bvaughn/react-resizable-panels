import { updateCursorStyle } from "./cursor/updateCursorStyle";
import { removeAxisFromInteraction } from "./mutable-state/interactions";
import { assert } from "../utils/assert";
import { calculateAvailableAxisSize } from "./dom/calculateAvailableAxisSize";
import { calculateHitRegions } from "./dom/calculateHitRegions";
import { calculateItemConstraints } from "./dom/calculateItemConstraints";
import { onDocumentContextMenu } from "./event-handlers/onDocumentContextMenu";
import { onDocumentDoubleClick } from "./event-handlers/onDocumentDoubleClick";
import { onDocumentKeyDown } from "./event-handlers/onDocumentKeyDown";
import { onDocumentLostPointerCapture } from "./event-handlers/onDocumentLostPointerCapture";
import { onDocumentPointerCancel } from "./event-handlers/onDocumentPointerCancel";
import { onDocumentPointerDown } from "./event-handlers/onDocumentPointerDown";
import { onDocumentPointerLeave } from "./event-handlers/onDocumentPointerLeave";
import { onDocumentPointerMove } from "./event-handlers/onDocumentPointerMove";
import { onDocumentPointerOut } from "./event-handlers/onDocumentPointerOut";
import { onDocumentPointerUp } from "./event-handlers/onDocumentPointerUp";
import { onWindowBlur } from "./event-handlers/onWindowBlur";
import {
  deleteMutableAxis,
  getMountedAxisState,
  updateMountedAxis
} from "./mutable-state/axes";
import type { SeparatorToItemsMap } from "./mutable-state/types";
import type { RegisteredResizeAxis } from "./types";
import { getDefaultLayout } from "./utils/getDefaultLayout";
import { layoutsEqual } from "./utils/layoutsEqual";
import { normalizeLayout } from "./utils/normalizeLayout";
import { notifyItemOnResize } from "./utils/notifyItemOnResize";
import { itemConstraintsEqual } from "./utils/itemConstraintsEqual";
import { preserveFixedItemSizes } from "./utils/preserveFixedItemSizes";
import { validateAxisLayout } from "./utils/validateAxisLayout";

const ownerDocumentReferenceCounts = new Map<Document, number>();

export function mountAxis(axis: RegisteredResizeAxis) {
  let isMounted = true;

  assert(
    axis.element.ownerDocument.defaultView,
    "Cannot register an unmounted Group"
  );

  const ResizeObserver = axis.element.ownerDocument.defaultView.ResizeObserver;

  const itemIds = new Set<string>();
  const separatorIds = new Set<string>();

  // Add Panels with onResize callbacks to ResizeObserver
  // Add Group to ResizeObserver also in order to sync % based constraints
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { borderBoxSize, target } = entry;
      if (target === axis.element) {
        if (isMounted) {
          const axisSize = calculateAvailableAxisSize({ axis });
          if (axisSize === 0) {
            // Can't calculate anything meaningful if the group has a width/height of 0
            // (This could indicate that it's within a hidden subtree)
            return;
          }

          const axisState = getMountedAxisState(axis.id);
          if (!axisState) {
            // Not mounted yet
            return;
          }

          // Update non-percentage based constraints
          const nextDerivedItemConstraints = calculateItemConstraints(axis);

          // Revalidate layout in case constraints have changed or group size changed
          // Start from the requested layout so that constraints only temporarily clamp item sizes (see #720)
          let requestedAxisSize = axisState.requestedAxisSize;
          let requestedLayout = axisState.requestedLayout;
          if (axisState.defaultLayoutDeferred) {
            requestedAxisSize = axisSize;
            requestedLayout = normalizeLayout({
              itemIds: axis.items.map(({ id }) => id),
              layout: getDefaultLayout({
                axis,
                itemConstraints: nextDerivedItemConstraints
              })
            });
          }

          const unsafeLayout = preserveFixedItemSizes({
            axis,
            nextAxisSize: axisSize,
            prevAxisSize: requestedAxisSize,
            prevLayout: requestedLayout
          });
          const nextLayout = validateAxisLayout({
            layout: unsafeLayout,
            itemConstraints: nextDerivedItemConstraints
          });

          if (
            !axisState.defaultLayoutDeferred &&
            layoutsEqual(axisState.layout, nextLayout) &&
            itemConstraintsEqual(
              axisState.derivedItemConstraints,
              nextDerivedItemConstraints
            ) &&
            axisState.axisSize === axisSize
          ) {
            continue;
          }

          updateMountedAxis(axis, {
            defaultLayoutDeferred: false,
            derivedItemConstraints: nextDerivedItemConstraints,
            axisSize,
            layout: nextLayout,
            requestedAxisSize,
            requestedLayout,
            separatorToItems: axisState.separatorToItems
          });
        }
      } else {
        notifyItemOnResize(axis, target as HTMLElement, borderBoxSize);
      }
    }
  });

  resizeObserver.observe(axis.element);

  axis.items.forEach((item) => {
    assert(
      !itemIds.has(item.id),
      `Panel ids must be unique; id "${item.id}" was used more than once`
    );

    itemIds.add(item.id);

    if (item.onResize) {
      resizeObserver.observe(item.element);
    }
  });

  const axisSize = calculateAvailableAxisSize({ axis });

  // Calculate initial layout for the new Panel configuration
  const derivedItemConstraints = calculateItemConstraints(axis);
  const defaultLayoutUnsafe = getDefaultLayout({
    axis,
    itemConstraints: derivedItemConstraints
  });
  const defaultLayoutSafe = validateAxisLayout({
    layout: defaultLayoutUnsafe,
    itemConstraints: derivedItemConstraints
  });

  const ownerDocument = axis.element.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;

  ownerDocumentReferenceCounts.set(
    ownerDocument,
    (ownerDocumentReferenceCounts.get(ownerDocument) ?? 0) + 1
  );

  const separatorToItems: SeparatorToItemsMap = new Map();

  // Include disabled separators because enabling them later does not rebuild this map.
  // The keyboard handler checks disabled state before resizing.
  const hitRegions = calculateHitRegions({ axis, includeDisabled: true });
  hitRegions.forEach((hitRegion) => {
    if (hitRegion.separator) {
      separatorToItems.set(hitRegion.separator, hitRegion.items);
    }
  });

  updateMountedAxis(axis, {
    defaultLayoutDeferred: axisSize === 0,
    derivedItemConstraints,
    axisSize,
    layout: defaultLayoutSafe,
    requestedAxisSize: axisSize,
    requestedLayout: normalizeLayout({
      itemIds: axis.items.map(({ id }) => id),
      layout: defaultLayoutUnsafe
    }),
    separatorToItems
  });

  axis.separators.forEach((separator) => {
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
    ownerDocument.addEventListener(
      "lostpointercapture",
      onDocumentLostPointerCapture,
      true
    );
    ownerDocument.addEventListener(
      "pointercancel",
      onDocumentPointerCancel,
      true
    );
    ownerDocument.addEventListener("pointerdown", onDocumentPointerDown, true);
    ownerDocument.addEventListener("pointerleave", onDocumentPointerLeave);
    ownerDocument.addEventListener("pointermove", onDocumentPointerMove);
    ownerDocument.addEventListener("pointerout", onDocumentPointerOut);
    ownerDocument.addEventListener("pointerup", onDocumentPointerUp, true);
    ownerWindow?.addEventListener("blur", onWindowBlur);
  }

  return function unmountAxis() {
    isMounted = false;

    ownerDocumentReferenceCounts.set(
      ownerDocument,
      Math.max(0, (ownerDocumentReferenceCounts.get(ownerDocument) ?? 0) - 1)
    );

    deleteMutableAxis(axis);
    if (removeAxisFromInteraction(axis)) {
      updateCursorStyle(ownerDocument);
    }

    axis.separators.forEach((separator) => {
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
        "lostpointercapture",
        onDocumentLostPointerCapture,
        true
      );
      ownerDocument.removeEventListener(
        "pointercancel",
        onDocumentPointerCancel,
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
      ownerWindow?.removeEventListener("blur", onWindowBlur);
    }

    resizeObserver.disconnect();
  };
}
