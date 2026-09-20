import type { PanelConstraints } from "../../components/panel/types";
import { compareLayoutNumbers } from "./compareLayoutNumbers";
import { formatLayoutNumber } from "./formatLayoutNumber";

// Panel size must be in percentages; pixel values should be pre-converted
export function validatePanelSize({
  overrideDisabledPanels,
  panelConstraints,
  prevSize,
  size
}: {
  overrideDisabledPanels?: boolean;
  panelConstraints: PanelConstraints;
  prevSize: number;
  size: number;
}) {
  const {
    collapsedSize = 0,
    collapsedThreshold,
    collapsible,
    disabled,
    maxSize = 100,
    minSize = 0
  } = panelConstraints;

  if (disabled && !overrideDisabledPanels) {
    return prevSize;
  }

  if (compareLayoutNumbers(size, minSize) < 0) {
    if (collapsible) {
      const threshold = collapsedThreshold ?? (minSize - collapsedSize) / 2;
      const wasCollapsed = compareLayoutNumbers(prevSize, collapsedSize) <= 0;
      const boundary = wasCollapsed
        ? collapsedSize + threshold
        : minSize - threshold;
      const comparison = compareLayoutNumbers(size, boundary);

      if (
        compareLayoutNumbers(size, collapsedSize) <= 0 ||
        comparison < 0 ||
        (collapsedThreshold !== undefined && wasCollapsed && comparison === 0)
      ) {
        size = collapsedSize;
      } else {
        size = minSize;
      }
    } else {
      size = minSize;
    }
  }

  size = Math.min(maxSize, size);
  size = formatLayoutNumber(size);

  return size;
}
