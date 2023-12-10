import { PanelData } from "../Panel";
import { Size } from "../types";

// Layout should be pre-converted into percentages
export function callPanelCallbacks(
  panelsArray: PanelData[],
  layout: number[],
  panelIdToLastNotifiedMixedSizesMap: Record<string, Size>
) {
  layout.forEach((size, index) => {
    const panelData = panelsArray[index];
    if (!panelData) {
      // Handle initial mount (when panels are registered too late to be in the panels array)
      // The subsequent render+effects will handle the resize notification
      // TODO [v1] Is this constraint still necessary?
      return;
    }

    const { callbacks, constraints, id: panelId } = panelData;
    const { collapsedSize = 0, collapsible } = constraints;

    const lastNotifiedSize = panelIdToLastNotifiedMixedSizesMap[panelId];
    if (lastNotifiedSize == null || size !== lastNotifiedSize) {
      panelIdToLastNotifiedMixedSizesMap[panelId] = size;

      const { onCollapse, onExpand, onResize } = callbacks;

      if (onResize) {
        onResize(size, lastNotifiedSize);
      }

      if (collapsible && (onCollapse || onExpand)) {
        if (
          onExpand &&
          (lastNotifiedSize == null || lastNotifiedSize === collapsedSize) &&
          size !== collapsedSize
        ) {
          onExpand();
        }

        if (
          onCollapse &&
          (lastNotifiedSize == null || lastNotifiedSize !== collapsedSize) &&
          size === collapsedSize
        ) {
          onCollapse();
        }
      }
    }
  });
}
