import type { RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredSeparator } from "../../components/separator/types";

export type HitRegion = {
  group: RegisteredGroup;
  panels: [panel: RegisteredPanel, panel: RegisteredPanel];
  rect: DOMRect;
  separator: RegisteredSeparator | undefined;
};

/**
 * Determines hit regions for a Group; a hit region is either:
 * - 1: An explicit Separator element
 * - 2: The edge of a Panel element that has another Panel beside it
 *
 * This method determines bounding rects of all regions for the particular group.
 */
export function calculateHitRegions(group: RegisteredGroup) {
  const { direction, element: groupElement, panels, separators } = group;

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
  let prevSeparator: RegisteredSeparator | undefined = undefined;

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
          separator: prevSeparator,
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
      const separatorData = separators.find(
        (current) => current.element === childElement
      );
      if (separatorData) {
        // No-op; this area will be included by default when closing the next panel
        prevSeparator = separatorData;
      } else {
        prevPanel = undefined;
        prevSeparator = undefined;
      }
    }
  }

  return hitRegions;
}
