import type { Layout, RegisteredGroup } from "../../components/group/types";
import { getMountedGroups } from "../mutable-state/groups";
import { updateInteractionState } from "../mutable-state/interactions";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";

export function onDocumentPointerDown(event: PointerEvent) {
  if (event.defaultPrevented) {
    return;
  } else if (event.pointerType === "mouse" && event.button > 0) {
    return;
  }

  const mountedGroups = getMountedGroups();

  const hitRegions = findMatchingHitRegions(event, mountedGroups);

  const initialLayoutMap = new Map<RegisteredGroup, Layout>();
  const previewHitRegion =
    hitRegions.find(
      ({ separator }) =>
        event.target instanceof Node &&
        separator?.element.contains(event.target)
    ) ?? hitRegions[0];

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

    const match = mountedGroups.get(current.group);
    if (match) {
      initialLayoutMap.set(current.group, match.layout);
    }
  });

  let preview;
  if (
    previewHitRegion?.group.resizePreviewMode === "separator" &&
    previewHitRegion.separator
  ) {
    const { element } = previewHitRegion.group;
    const groupRect = element.getBoundingClientRect();
    const rect = previewHitRegion.separator.element.getBoundingClientRect();
    preview = {
      hitRegion: previewHitRegion,
      rect: new DOMRect(
        rect.left - groupRect.left - element.clientLeft + element.scrollLeft,
        rect.top - groupRect.top - element.clientTop + element.scrollTop,
        rect.width,
        rect.height
      ),
      offset: 0
    };
  }

  updateInteractionState({
    cursorFlags: 0,
    hitRegions,
    initialLayoutMap,
    pointerDownAtPoint: { x: event.clientX, y: event.clientY },
    preview,
    state: "active"
  });

  if (hitRegions.length) {
    event.preventDefault();
  }
}
