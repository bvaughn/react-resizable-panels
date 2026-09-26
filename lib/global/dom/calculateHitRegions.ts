import { sortByElementOffset } from "../../components/group/sortByElementOffset";
import { isHTMLElement } from "../../utils/isHTMLElement";
import type {
  HitRegion,
  RegisteredResizeAxis,
  RegisteredResizeItem,
  RegisteredSeparator
} from "../types";
import { findClosestRect } from "../utils/findClosestRect";
import { expandHitTarget } from "../utils/expandHitTarget";
import { calculateAvailableAxisSize } from "./calculateAvailableAxisSize";

/**
 * Determines hit regions for a Group; a hit region is either:
 * - 1: An explicit Separator element
 * - 2: The edge of a Panel element that has another Panel beside it
 *
 * This method determines bounding rects of all regions for the particular group.
 */
export function calculateHitRegions({
  expandHitTargets = true,
  axis,
  includeDisabled = false
}: {
  expandHitTargets?: boolean;
  axis: RegisteredResizeAxis;
  includeDisabled?: boolean;
}) {
  if (axis.layoutStrategy) {
    return axis.layoutStrategy.calculateHitRegions({
      expandHitTargets,
      axis,
      includeDisabled
    });
  }

  const { element: axisElement, orientation, items, separators } = axis;

  // Sort elements by offset before traversing
  const sortedChildElements: HTMLElement[] = sortByElementOffset(
    orientation,
    Array.from(axisElement.children)
      .filter(isHTMLElement)
      .filter((element) => !element.hasAttribute("data-resize-preview"))
      .map((element) => ({ element: element as HTMLElement }))
  ).map(({ element }) => element);

  const hitRegions: HitRegion[] = [];

  let disabledSeparator = false;
  let hasInterleavedStaticContent = false;
  let firstEnabledItemIndex = -1;
  let axisSize: number | undefined;
  let lastEnabledItemIndex = -1;
  let numEnabledItems = 0;
  let prevItem: RegisteredResizeItem | undefined = undefined;
  let pendingSeparators: RegisteredSeparator[] = [];

  {
    let currentItemIndex = -1;

    for (const childElement of sortedChildElements) {
      if (childElement.hasAttribute("data-panel")) {
        currentItemIndex++;

        if (!childElement.hasAttribute("data-disabled")) {
          numEnabledItems++;

          if (firstEnabledItemIndex === -1) {
            firstEnabledItemIndex = currentItemIndex;
          }

          lastEnabledItemIndex = currentItemIndex;
        }
      }
    }
  }

  // If all (or all but one) of the Panels are disabled, there can be no resize interactions.
  if (includeDisabled || numEnabledItems > 1) {
    let currentItemIndex = -1;

    for (const childElement of sortedChildElements) {
      if (childElement.hasAttribute("data-panel")) {
        currentItemIndex++;

        const itemData = items.find(
          (current) => current.element === childElement
        );
        if (itemData) {
          if (prevItem) {
            const prevRect = prevItem.element.getBoundingClientRect();
            const rect = childElement.getBoundingClientRect();

            let pendingRectsOrSeparators: (DOMRect | RegisteredSeparator)[];

            // If an explicit Separator has been rendered, always watch it
            // Otherwise watch the entire space between the panels
            // The one caveat is when there are non-interactive element(s) between panels,
            // in which case we may need to watch individual panel edges
            if (hasInterleavedStaticContent) {
              const firstItemEdgeRect =
                orientation === "horizontal"
                  ? new DOMRect(
                      prevRect.right,
                      prevRect.top,
                      0,
                      prevRect.height
                    )
                  : new DOMRect(
                      prevRect.left,
                      prevRect.bottom,
                      prevRect.width,
                      0
                    );
              const secondItemEdgeRect =
                orientation === "horizontal"
                  ? new DOMRect(rect.left, rect.top, 0, rect.height)
                  : new DOMRect(rect.left, rect.top, rect.width, 0);

              switch (pendingSeparators.length) {
                case 0: {
                  pendingRectsOrSeparators = [
                    firstItemEdgeRect,
                    secondItemEdgeRect
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
                      ? secondItemEdgeRect
                      : firstItemEdgeRect
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
              const rect = expandHitTarget({
                expandHitTargets,
                axis,
                rect:
                  "width" in rectOrSeparator
                    ? rectOrSeparator
                    : rectOrSeparator.element.getBoundingClientRect()
              });

              const skip =
                currentItemIndex <= firstEnabledItemIndex ||
                currentItemIndex > lastEnabledItemIndex;

              if (includeDisabled || (!disabledSeparator && !skip)) {
                axisSize ??= calculateAvailableAxisSize({ axis });

                hitRegions.push({
                  axis,
                  axisSize,
                  items: [prevItem, itemData],
                  separator:
                    "width" in rectOrSeparator ? undefined : rectOrSeparator,
                  rect
                });
              }

              disabledSeparator = false;
            }
          }

          hasInterleavedStaticContent = false;
          prevItem = itemData;
          pendingSeparators = [];
        }
      } else if (childElement.hasAttribute("data-separator")) {
        if (childElement.ariaDisabled !== null) {
          disabledSeparator = true;
        }

        const separatorData = separators.find(
          (current) => current.element === childElement
        );
        if (separatorData) {
          // Separators will be included implicitly in the area between the previous and next panel
          // It's important to track them though, to handle the scenario of non-interactive group content
          pendingSeparators.push(separatorData);
        } else {
          prevItem = undefined;
          pendingSeparators = [];
        }
      } else {
        hasInterleavedStaticContent = true;
      }
    }
  }

  return hitRegions;
}
