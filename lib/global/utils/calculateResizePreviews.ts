import type { RegisteredGroup } from "../../components/group/types";
import {
  calculateHitRegions,
  type HitRegion
} from "../dom/calculateHitRegions";
import type { ResizePreview } from "../mutable-state/types";
import { layoutNumbersEqual } from "./layoutNumbersEqual";

export function calculateResizePreviews(
  group: RegisteredGroup,
  hitRegions: HitRegion[]
): ResizePreview[] {
  const { element, orientation, panels } = group;

  const groupRect = element.getBoundingClientRect();
  const horizontal = orientation === "horizontal";

  // Use the same boundaries as hit testing, including separate edges around
  // static content. Disabled boundaries can still move indirectly during a drag.
  const boundaries = calculateHitRegions({
    expandHitTargets: false,
    group,
    includeDisabled: true
  });

  return boundaries.map(
    ({ panels: boundaryPanels, rect, separator }, index) => {
      const panelIndex = panels.indexOf(boundaryPanels[0]);
      const center = horizontal
        ? rect.left + rect.width / 2
        : rect.top + rect.height / 2;

      const active = hitRegions.some((region) => {
        if (region.group !== group || region.panels[0] !== boundaryPanels[0]) {
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
        group,
        key: separator
          ? `separator-${separator.id}`
          : `panel-${boundaryPanels[0].id}-${index}`,
        offset: 0,
        panelIndex,
        rect: new DOMRect(
          (horizontal && !separator ? center : rect.left) -
            groupRect.left -
            element.clientLeft +
            element.scrollLeft,
          (!horizontal && !separator ? center : rect.top) -
            groupRect.top -
            element.clientTop +
            element.scrollTop,
          horizontal && !separator ? 0 : rect.width,
          !horizontal && !separator ? 0 : rect.height
        ),
        separator
      };
    }
  );
}
