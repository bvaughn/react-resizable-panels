import type { RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredResizeHandle } from "../../components/resize-handle/types";

export type HitRegion = {
  group: RegisteredGroup;
  panels: [panel: RegisteredPanel, panel: RegisteredPanel];
  rect: DOMRect;
  resizeHandle: RegisteredResizeHandle | undefined;
};

/**
 * Determines hit regions for a Group; a hit region is either:
 * - 1: An explicit ResizeHandle element
 * - 2: The edge of a Panel element that has another Panel beside it
 *
 * This method determines bounding rects of all regions for the particular group.
 */
export function calculateHitRegions(group: RegisteredGroup) {
  const { direction, element: groupElement, panels, resizeHandles } = group;

  // Sort elements by offset before traversing
  const sortedChildElements: HTMLElement[] = Array.from(groupElement.children)
    .filter((child) => child instanceof HTMLElement)
    .sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();

      return direction === "horizontal"
        ? rectA.left - rectB.left
        : rectA.top - rectB.top;
    });

  const hitRegions: HitRegion[] = [];

  let prevPanel: RegisteredPanel | undefined = undefined;
  let prevResizeHandle: RegisteredResizeHandle | undefined = undefined;

  for (const childElement of sortedChildElements) {
    const panelData = panels.find(
      (current) => current.element === childElement
    );
    if (panelData) {
      if (prevPanel) {
        const prevRect = prevPanel.element.getBoundingClientRect();
        const rect = childElement.getBoundingClientRect();

        hitRegions.push({
          group,
          panels: [prevPanel, panelData],
          resizeHandle: prevResizeHandle,
          rect:
            direction === "horizontal"
              ? new DOMRect(
                  prevRect.right,
                  rect.top,
                  rect.left - prevRect.right,
                  rect.height
                )
              : new DOMRect(
                  rect.left,
                  prevRect.bottom,
                  rect.width,
                  rect.top - prevRect.bottom
                )
        });
      }

      prevPanel = panelData;
    } else {
      const resizeHandleData = resizeHandles.find(
        (current) => current.element === childElement
      );
      if (resizeHandleData) {
        // No-op; this area will be included by default when closing the next panel
        prevResizeHandle = resizeHandleData;
      } else {
        prevPanel = undefined;
        prevResizeHandle = undefined;
      }
    }
  }

  return hitRegions;
}
