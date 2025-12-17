import { sortByElementOffset } from "../../components/group/sortByElementOffset";
import type { RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredSeparator } from "../../components/separator/types";
import { calculateAvailableGroupSize } from "./calculateAvailableGroupSize";

type PanelsTuple = [panel: RegisteredPanel, panel: RegisteredPanel];

export type HitRegion = {
  group: RegisteredGroup;
  groupSize: number;
  panels: PanelsTuple;
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
  const { element: groupElement, orientation, panels, separators } = group;

  // Sort elements by offset before traversing
  const sortedChildElements: HTMLElement[] = sortByElementOffset(
    orientation,
    Array.from(groupElement.children)
      .filter((child) => child instanceof HTMLElement)
      .map((element) => ({ element }))
  ).map(({ element }) => element);

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
          groupSize: calculateAvailableGroupSize({ group }),
          panels: [prevPanel, panelData],
          separator: prevSeparator,
          rect:
            orientation === "horizontal"
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
      prevSeparator = undefined;
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
