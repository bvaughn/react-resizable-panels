import { useState } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import type { Orientation } from "../../global/types";
import { getScrollContainer } from "../utils/getScrollContainer";

/**
 * The size (in layout pixels, along an orientation) of the part of an element that is visible: where it overlaps the element it scrolls within (or the viewport),
 * e.g. so that a tabset maximized within a workspace that grows (see the growDirection prop) covers what's visible, rather than the whole workspace.
 *
 * ℹ️ Only measured while `isEnabled`; updated when the window, that element, or the element itself is scrolled or resized.
 */
export function useVisibleSize(
  element: HTMLElement | null,
  orientation: Orientation | undefined,
  isEnabled: boolean
): number | undefined {
  const [size, setSize] = useState<number | undefined>(undefined);

  useIsomorphicLayoutEffect(() => {
    const ownerWindow = element?.ownerDocument.defaultView;
    if (!element || !orientation || !isEnabled || !ownerWindow) {
      setSize(undefined);
      return;
    }

    const ownerDocument = element.ownerDocument;
    const isVertical = orientation === "vertical";
    const container = getScrollContainer(element, orientation);
    const isDocument =
      !container || container === element.ownerDocument.scrollingElement;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const containerRect = isDocument
        ? {
            bottom: ownerWindow.innerHeight,
            left: 0,
            right: ownerWindow.innerWidth,
            top: 0
          }
        : container.getBoundingClientRect();

      const start = Math.max(
        isVertical ? rect.top : rect.left,
        isVertical ? containerRect.top : containerRect.left
      );
      const end = Math.min(
        isVertical ? rect.bottom : rect.right,
        isVertical ? containerRect.bottom : containerRect.right
      );
      const next = Math.round(Math.max(0, end - start));
      setSize((prev) => (prev === next ? prev : next));
    };
    measure();

    ownerWindow.addEventListener("resize", measure);
    // Scrolls don't bubble; capturing them on the document includes ancestors that scroll the workspace (not only its container)
    ownerDocument.addEventListener("scroll", measure, {
      capture: true,
      passive: true
    });
    const resizeObserver = ownerWindow.ResizeObserver
      ? new ownerWindow.ResizeObserver(measure)
      : null;
    resizeObserver?.observe(element);
    if (!isDocument) {
      resizeObserver?.observe(container);
    }

    return () => {
      ownerWindow.removeEventListener("resize", measure);
      ownerDocument.removeEventListener("scroll", measure, true);
      resizeObserver?.disconnect();
    };
  }, [element, isEnabled, orientation]);

  return size;
}
