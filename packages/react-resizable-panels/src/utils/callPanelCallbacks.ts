import { PanelData } from "../Panel";
import { assert } from "./assert";
import { fuzzyNumbersEqual } from "./numbers/fuzzyCompareNumbers";

// Layout should be pre-converted into percentages
export function callPanelCallbacks(
  panelsArray: PanelData[],
  layout: number[],
  panelIdToLastNotifiedSizeMap: Record<string, number>
) {
  layout.forEach((size, index) => {
    const panelData = panelsArray[index];
    assert(panelData, `Panel data not found for index ${index}`);

    const { callbacks, constraints, id: panelId } = panelData;
    const { collapsedSize = 0, collapsible } = constraints;

    const lastNotifiedSize = panelIdToLastNotifiedSizeMap[panelId];
    if (lastNotifiedSize == null || size !== lastNotifiedSize) {
      panelIdToLastNotifiedSizeMap[panelId] = size;

      const { onCollapse, onExpand, onResize } = callbacks;

      if (onResize) {
        onResize(size, lastNotifiedSize);
      }

      if (collapsible && (onCollapse || onExpand)) {
        if (
          onExpand &&
          (lastNotifiedSize == null ||
            fuzzyNumbersEqual(lastNotifiedSize, collapsedSize)) &&
          !fuzzyNumbersEqual(size, collapsedSize)
        ) {
          onExpand();
        }

        if (
          onCollapse &&
          (lastNotifiedSize == null ||
            !fuzzyNumbersEqual(lastNotifiedSize, collapsedSize)) &&
          fuzzyNumbersEqual(size, collapsedSize)
        ) {
          onCollapse();
        }
      }
    }
  });
}
