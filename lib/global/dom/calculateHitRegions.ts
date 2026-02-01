import { sortByElementOffset } from "../../components/group/utils/sortByElementOffset";
import type { MutableGroup } from "../../state/MutableGroup";
import type { MutablePanel } from "../../state/MutablePanel";
import type { MutableSeparator } from "../../state/MutableSeparator";
import { Rect } from "../../types";
import { findClosestRect } from "../../utils/findClosestRect";
import { isCoarsePointer } from "../../utils/isCoarsePointer";
import { calculateAvailableGroupSize } from "./calculateAvailableGroupSize";

type PanelsTuple = [panel: MutablePanel, panel: MutablePanel];

export type HitRegion = {
  group: MutableGroup;
  groupSize: number;
  panels: PanelsTuple;
  rect: Rect;
  separator?: MutableSeparator | undefined;
};

/**
 * Determines hit regions for a Group; a hit region is either:
 * - 1: An explicit Separator element
 * - 2: The edge of a Panel element that has another Panel beside it
 *
 * This method determines bounding rects of all regions for the particular group.
 */
export function calculateHitRegions(group: MutableGroup) {
  const { elementInterface, orientation, panels, separators } = group;

  // Sort elements by offset before traversing
  const sortedChildElements: HTMLElement[] = sortByElementOffset(
    orientation,
    elementInterface.getChildren()
  );

  const hitRegions: HitRegion[] = [];

  let hasInterleavedStaticContent = false;
  let prevPanel: MutablePanel | undefined = undefined;
  let pendingSeparators: MutableSeparator[] = [];

  for (const childElement of sortedChildElements) {
    if (childElement.hasAttribute("data-panel")) {
      const id = childElement.getAttribute("id");
      const panelData = panels.find((current) => current.id === id);
      if (panelData) {
        if (prevPanel) {
          const prevRect = prevPanel.elementInterface.getElementRect();
          const rect = childElement.getBoundingClientRect();

          let pendingRectsOrSeparators: (DOMRect | MutableSeparator)[];

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
                  targetRect: separator.elementInterface.getElementRect()
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
            let rect =
              "width" in rectOrSeparator
                ? rectOrSeparator
                : rectOrSeparator.elementInterface.getElementRect();

            const minHitTargetSize = isCoarsePointer()
              ? group.resizeTargetMinimumSize.coarse
              : group.resizeTargetMinimumSize.fine;
            if (rect.width < minHitTargetSize) {
              const delta = minHitTargetSize - rect.width;
              rect = new DOMRect(
                rect.x - delta / 2,
                rect.y,
                rect.width + delta,
                rect.height
              );
            }
            if (rect.height < minHitTargetSize) {
              const delta = minHitTargetSize - rect.height;
              rect = new DOMRect(
                rect.x,
                rect.y - delta / 2,
                rect.width,
                rect.height + delta
              );
            }

            hitRegions.push({
              group,
              groupSize: calculateAvailableGroupSize(group),
              panels: [prevPanel, panelData],
              separator:
                "width" in rectOrSeparator ? undefined : rectOrSeparator,
              rect
            });
          }
        }

        hasInterleavedStaticContent = false;
        prevPanel = panelData;
        pendingSeparators = [];
      }
    } else if (childElement.hasAttribute("data-separator")) {
      const id = childElement.getAttribute("id");
      const separatorData = separators.find((current) => current.id === id);
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
