import type { Orientation } from "../../global/types";
import { getScrollContainer } from "./getScrollContainer";

// Within this distance (in pixels) of the edge of the scroll container, dragging scrolls it, faster closer to the edge
const EDGE_DISTANCE = 48;
const MAX_SPEED = 24;

/**
 * Scrolls the element that a workspace scrolls within (its nearest scrollable ancestor along an orientation, or the document)
 * while the pointer is near one of its edges during a drag, e.g. so that rows of a workspace that grows (see the growDirection prop)
 * that are scrolled out of view can be dropped onto.
 *
 * @param onScroll Called after each scroll (e.g. to find the drop target under the pointer again)
 * @param onBlocked Called instead when there's nothing further to scroll (with the distance that would have been scrolled),
 * e.g. to make the content larger (so that it can be scrolled further); the scroller keeps trying while the pointer is near the edge.
 * Without it, the scroller stops until the pointer moves again.
 */
export function createAutoScroller(
  element: HTMLElement,
  orientation: Orientation,
  onScroll: () => void,
  onBlocked?: (distance: number) => void
) {
  const ownerWindow = element.ownerDocument.defaultView;
  const container = getScrollContainer(element, orientation);
  const isVertical = orientation === "vertical";

  let speed = 0;
  let frameId: number | null = null;

  const isDocument = container === element.ownerDocument.scrollingElement;
  const getPosition = () =>
    !container || !ownerWindow
      ? 0
      : isDocument
        ? isVertical
          ? ownerWindow.scrollY
          : ownerWindow.scrollX
        : isVertical
          ? container.scrollTop
          : container.scrollLeft;

  const step = () => {
    frameId = null;
    if (speed === 0 || !container || !ownerWindow) {
      return;
    }

    const before = getPosition();
    // Sub-pixel distances may not move the scroll position, and smooth scrolling wouldn't move it right away
    const distance = Math.sign(speed) * Math.max(1, Math.abs(speed));
    const options: ScrollToOptions = {
      behavior: "instant",
      ...(isVertical ? { top: distance } : { left: distance })
    };
    if (isDocument) {
      ownerWindow.scrollBy(options);
    } else {
      container.scrollBy(options);
    }

    // At the end of what can be scrolled, nothing changes: the loop stops until the pointer moves again (see update),
    // unless something can make the content larger
    if (getPosition() === before) {
      if (!onBlocked) {
        return;
      }
      onBlocked(distance);
    } else {
      onScroll();
    }

    frameId = ownerWindow.requestAnimationFrame(step);
  };

  return {
    stop: () => {
      speed = 0;
      if (frameId !== null) {
        ownerWindow?.cancelAnimationFrame(frameId);
        frameId = null;
      }
    },
    update: (clientX: number, clientY: number) => {
      if (!container || !ownerWindow) {
        return;
      }

      // The document scrolls within the viewport; other containers within their own bounds
      const rect = isDocument
        ? {
            bottom: ownerWindow.innerHeight,
            left: 0,
            right: ownerWindow.innerWidth,
            top: 0
          }
        : container.getBoundingClientRect();
      const position = isVertical ? clientY : clientX;
      const start = isVertical ? rect.top : rect.left;
      const end = isVertical ? rect.bottom : rect.right;

      if (position < start + EDGE_DISTANCE) {
        speed =
          -MAX_SPEED *
          Math.min(1, (start + EDGE_DISTANCE - position) / EDGE_DISTANCE);
      } else if (position > end - EDGE_DISTANCE) {
        speed =
          MAX_SPEED *
          Math.min(1, (position - (end - EDGE_DISTANCE)) / EDGE_DISTANCE);
      } else {
        speed = 0;
      }

      if (speed !== 0 && frameId === null) {
        frameId = ownerWindow.requestAnimationFrame(step);
      }
    }
  };
}
