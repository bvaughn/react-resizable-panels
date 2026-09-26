import { calculateHitRegions } from "../dom/calculateHitRegions";
import type { ResizePreview } from "../mutable-state/types";
import type { HitRegion, RegisteredResizeAxis } from "../types";
import { layoutNumbersEqual } from "./layoutNumbersEqual";

export function calculateResizePreviews(
  axis: RegisteredResizeAxis,
  hitRegions: HitRegion[]
): ResizePreview[] {
  const { element, orientation, items } = axis;

  const axisRect = element.getBoundingClientRect();
  const horizontal = orientation === "horizontal";

  // Use the same boundaries as hit testing, including separate edges around
  // static content. Disabled boundaries can still move indirectly during a drag.
  const boundaries = calculateHitRegions({
    expandHitTargets: false,
    axis,
    includeDisabled: true
  });

  return boundaries.map(({ items: boundaryItems, rect, separator }, index) => {
    const itemIndex = items.indexOf(boundaryItems[0]);
    const center = horizontal
      ? rect.left + rect.width / 2
      : rect.top + rect.height / 2;

    const active = hitRegions.some((region) => {
      if (region.axis !== axis || region.items[0] !== boundaryItems[0]) {
        return false;
      }

      if (separator || region.separator) {
        return region.separator === separator;
      }

      const regionCenter = horizontal
        ? region.rect.left + region.rect.width / 2
        : region.rect.top + region.rect.height / 2;

      return layoutNumbersEqual(center, regionCenter);
    });

    return {
      active,
      axis,
      key: separator
        ? `separator-${separator.id}`
        : `panel-${boundaryItems[0].id}-${index}`,
      offset: 0,
      itemIndex,
      rect: new DOMRect(
        (horizontal && !separator ? center : rect.left) -
          axisRect.left -
          element.clientLeft +
          element.scrollLeft,
        (!horizontal && !separator ? center : rect.top) -
          axisRect.top -
          element.clientTop +
          element.scrollTop,
        horizontal && !separator ? 0 : rect.width,
        !horizontal && !separator ? 0 : rect.height
      ),
      separator
    };
  });
}
