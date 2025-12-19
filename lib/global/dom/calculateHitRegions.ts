import { sortByElementOffset } from "../../components/group/sortByElementOffset";
import type { RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import type { RegisteredSeparator } from "../../components/separator/types";
import { findClosestRect } from "../utils/findClosestRect";
import { calculateAvailableGroupSize } from "./calculateAvailableGroupSize";

type PanelsTuple = [panel: RegisteredPanel, panel: RegisteredPanel];

export type HitRegion = {
  group: RegisteredGroup;
  groupSize: number;
  panels: PanelsTuple;
  rect: DOMRect;
  separator?: RegisteredSeparator | undefined;
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

  let hasInterleavedStaticContent = false;
  let prevPanel: RegisteredPanel | undefined = undefined;
  let pendingSeparators: RegisteredSeparator[] = [];

  for (const childElement of sortedChildElements) {
    if (childElement.hasAttribute("data-panel")) {
      const panelData = panels.find(
        (current) => current.element === childElement
      );
      if (panelData) {
        if (prevPanel) {
          const prevRect = prevPanel.element.getBoundingClientRect();
          const rect = childElement.getBoundingClientRect();

          let pendingRectsOrSeparators: (DOMRect | RegisteredSeparator)[];

          // If an explicit Separator has been rendered, always watch it
          // Otherwise watch the entire space between the panels
          // The one caveat is when there are non-interactive element(s) between panels,
          // in which case we may need to watch individual panel edges
          if (hasInterleavedStaticContent) {
            const firstPanelEdgeRect =
              orientation === "horizontal"
                ? new DOMRect(prevRect.right, prevRect.top, 0, prevRect.height)
                : new DOMRect(
                    prevRect.left,
                    prevRect.bottom,
                    prevRect.width,
                    0
                  );
            const secondPanelEdgeRect =
              orientation === "horizontal"
                ? new DOMRect(rect.left, rect.top, 0, rect.height)
                : new DOMRect(rect.left, rect.top, rect.width, 0);

            switch (pendingSeparators.length) {
              case 0: {
                pendingRectsOrSeparators = [
                  firstPanelEdgeRect,
                  secondPanelEdgeRect
                ];
                break;
              }
              case 1: {
                const separator = pendingSeparators[0];
                const closestRect = findClosestRect({
                  orientation,
                  rects: [prevRect, rect],
                  targetRect: separator.element.getBoundingClientRect()
                });

                pendingRectsOrSeparators = [
                  separator,
                  closestRect === prevRect
                    ? secondPanelEdgeRect
                    : firstPanelEdgeRect
                ];
                break;
              }
              default: {
                pendingRectsOrSeparators = pendingSeparators;
                break;
              }
            }
          } else {
            if (pendingSeparators.length) {
              pendingRectsOrSeparators = pendingSeparators;
            } else {
              pendingRectsOrSeparators = [
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
              ];
            }
          }

          for (const rectOrSeparator of pendingRectsOrSeparators) {
            hitRegions.push({
              group,
              groupSize: calculateAvailableGroupSize({ group }),
              panels: [prevPanel, panelData],
              separator:
                "width" in rectOrSeparator ? undefined : rectOrSeparator,
              rect:
                "width" in rectOrSeparator
                  ? rectOrSeparator
                  : rectOrSeparator.element.getBoundingClientRect()
            });
          }
        }

        hasInterleavedStaticContent = false;
        prevPanel = panelData;
        pendingSeparators = [];
      }
    } else if (childElement.hasAttribute("data-separator")) {
      const separatorData = separators.find(
        (current) => current.element === childElement
      );
      if (separatorData) {
        // Separators will be included implicitly in the area between the previous and next panel
        // It's important to track them though, to handle the scenario of non-interactive group content
        pendingSeparators.push(separatorData);
      } else {
        prevPanel = undefined;
        pendingSeparators = [];
      }
    } else {
      hasInterleavedStaticContent = true;
    }
  }

  return hitRegions;
}
