import { calculateResizePreviews } from "../utils/calculateResizePreviews";
import { getMountedAxes } from "../mutable-state/axes";
import {
  getInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import type { Layout, RegisteredResizeAxis } from "../types";
import { abortActivePointerResize } from "../utils/abortActivePointerResize";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";

export function onDocumentPointerDown(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  const interactionState = getInteractionState();
  if (interactionState.state === "active") {
    if (event.pointerId === interactionState.pointerId) {
      // The same pointer can't be pressed twice, so its release was missed (e.g. it happened in another document)
      // End that drag, but don't start a new one;
      // committing its layout may move the separator out from under the pointer
      abortActivePointerResize(
        interactionState.ownerDocument,
        interactionState.pointerId
      );
    }

    // Otherwise another pointer is still dragging; let it finish rather than replacing (and orphaning) its drag
    return;
  }

  const mountedAxes = getMountedAxes();

  const hitRegions = findMatchingHitRegions(
    event,
    mountedAxes,
    event.currentTarget as Document
  );
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
    ownerDocument: event.currentTarget as Document,
    pointerDownAtPoint: { x: event.clientX, y: event.clientY },
    pointerId: event.pointerId,
    previewLayoutMap: new Map(initialLayoutMap),
    previews,
    state: "active"
  });

  event.preventDefault();
}
