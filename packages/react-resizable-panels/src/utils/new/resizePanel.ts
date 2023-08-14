import { computePercentagePanelConstraints } from "./computePercentagePanelConstraints";
import { PanelConstraints } from "./types";

// Panel size must be in percentages; pixel values should be pre-converted
export function resizePanel({
  groupSizePixels,
  panelConstraints,
  panelIndex,
  size,
}: {
  groupSizePixels: number;
  panelConstraints: PanelConstraints[];
  panelIndex: number;
  size: number;
}) {
  let { collapsible } = panelConstraints[panelIndex]!;

  const { collapsedSizePercentage, maxSizePercentage, minSizePercentage } =
    computePercentagePanelConstraints(
      panelConstraints,
      panelIndex,
      groupSizePixels
    );

  if (minSizePercentage != null) {
    if (size < minSizePercentage) {
      if (collapsible) {
        size = collapsedSizePercentage;
      } else {
        size = minSizePercentage;
      }
    }
  }

  if (maxSizePercentage != null) {
    size = Math.min(maxSizePercentage, size);
  }

  return size;
}
