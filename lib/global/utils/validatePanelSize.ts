import type { PanelConstraints } from "../../components/panel/types";
import { compareLayoutNumbers } from "./compareLayoutNumbers";
import { formatLayoutNumber } from "./formatLayoutNumber";

// Panel size must be in percentages; pixel values should be pre-converted
export function validatePanelSize({
  panelConstraints,
  size
}: {
  panelConstraints: PanelConstraints;
  size: number;
}) {
  const {
    collapsedSize = 0,
    collapsible,
    maxSize = 100,
    minSize = 0
  } = panelConstraints;

  if (compareLayoutNumbers(size, minSize) < 0) {
    if (collapsible) {
      // Collapsible panels should snap closed or open only once they cross the halfway point between collapsed and min size.
      const halfwayPoint = (collapsedSize + minSize) / 2;
      if (compareLayoutNumbers(size, halfwayPoint) < 0) {
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
