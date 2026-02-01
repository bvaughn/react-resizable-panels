import type { MutableGroup } from "../../state/MutableGroup";

/**
 * Calculates the total pixel size within a Group element that's used by its Panel elements.
 * This value is then used to calculate an individual Panel's percentage size.
 *
 * This method intentionally ignores space taken up by styles (e.g. padding, border, flex gap)
 * and other children (e.g. Separator elements or fixed-size panels).
 */
export function calculateAvailableGroupSize(group: MutableGroup) {
  let totalSize = 0;

  for (const panel of group.panels) {
    const rect = panel.elementInterface.getElementRect();
    totalSize += group.orientation === "horizontal" ? rect.width : rect.height;
  }

  return totalSize;
}
