import { calculateResizePreviews } from "../utils/calculateResizePreviews";
import { getMountedAxes } from "../mutable-state/axes";
import { updateInteractionState } from "../mutable-state/interactions";
import type { Layout, RegisteredResizeAxis } from "../types";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";

export function onDocumentPointerDown(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  const mountedAxes = getMountedAxes();

  const hitRegions = findMatchingHitRegions(event, mountedAxes);
  if (hitRegions.length === 0) {
    return;
  }

  const initialLayoutMap = new Map<RegisteredResizeAxis, Layout>();
  let didChangeFocus = false;

  hitRegions.forEach((current) => {
    if (current.separator) {
      if (!didChangeFocus) {
        didChangeFocus = true;

        current.separator.element.focus({
          // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#browser_compatibility
          focusVisible: false,
          preventScroll: true
        });

        // TRICKY
        // Calling setPointerCapture() here would help with detecting pointer "pointermove"/"pointerup" events that happen over iframes
        // but it would also prevent "click" events from firing if the use releases without actually dragging
        // Because of this, it's safer to wait until the first "pointermove" event to set capture
      }
    }

    const match = mountedAxes.get(current.axis);
    if (match) {
      initialLayoutMap.set(current.axis, match.layout);
    }
  });

  const previews = Array.from(initialLayoutMap.keys()).flatMap((axis) =>
    axis.resizePreviewMode === "separator"
      ? calculateResizePreviews(axis, hitRegions)
      : []
  );

  updateInteractionState({
    cursorFlags: 0,
    didPointerMove: false,
    hitRegions,
    initialLayoutMap,
    pointerDownAtPoint: { x: event.clientX, y: event.clientY },
    previewLayoutMap: new Map(initialLayoutMap),
    previews,
    state: "active"
  });

  event.preventDefault();
}
