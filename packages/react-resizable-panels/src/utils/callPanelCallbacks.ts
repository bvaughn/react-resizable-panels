import { PanelData } from "../Panel";
import { MixedSizes } from "../types";
import { calculateAvailablePanelSizeInPixels } from "../utils/dom/calculateAvailablePanelSizeInPixels";
import { convertPercentageToPixels } from "./convertPercentageToPixels";
import { getPercentageSizeFromMixedSizes } from "./getPercentageSizeFromMixedSizes";

// Layout should be pre-converted into percentages
export function callPanelCallbacks(
  groupId: string,
  panelsArray: PanelData[],
  layout: number[],
  panelIdToLastNotifiedMixedSizesMap: Record<string, MixedSizes>
) {
  const groupSizePixels = calculateAvailablePanelSizeInPixels(groupId);

  layout.forEach((sizePercentage, index) => {
    const panelData = panelsArray[index];
    if (!panelData) {
      // Handle initial mount (when panels are registered too late to be in the panels array)
      // The subsequent render+effects will handle the resize notification
      return;
    }

    const { callbacks, constraints, id: panelId } = panelData;
    const { collapsible } = constraints;

    const mixedSizes: MixedSizes = {
      sizePercentage,
      sizePixels: convertPercentageToPixels(sizePercentage, groupSizePixels),
    };

    const lastNotifiedMixedSizes = panelIdToLastNotifiedMixedSizesMap[panelId];
    if (
      lastNotifiedMixedSizes == null ||
      mixedSizes.sizePercentage !== lastNotifiedMixedSizes.sizePercentage ||
      mixedSizes.sizePixels !== lastNotifiedMixedSizes.sizePixels
    ) {
      panelIdToLastNotifiedMixedSizesMap[panelId] = mixedSizes;

      const { onCollapse, onExpand, onResize } = callbacks;

      if (onResize) {
        onResize(mixedSizes, lastNotifiedMixedSizes);
      }

      if (collapsible && (onCollapse || onExpand)) {
        const collapsedSize =
          getPercentageSizeFromMixedSizes(
            {
              sizePercentage: constraints.collapsedSizePercentage,
              sizePixels: constraints.collapsedSizePixels,
            },
            groupSizePixels
          ) ?? 0;

        const size = getPercentageSizeFromMixedSizes(
          mixedSizes,
          groupSizePixels
        );

        if (
          onExpand &&
          (lastNotifiedMixedSizes == null ||
            lastNotifiedMixedSizes.sizePercentage === collapsedSize) &&
          size !== collapsedSize
        ) {
          onExpand();
        }

        if (
          onCollapse &&
          (lastNotifiedMixedSizes == null ||
            lastNotifiedMixedSizes.sizePercentage !== collapsedSize) &&
          size === collapsedSize
        ) {
          onCollapse();
        }
      }
    }
  });
}
