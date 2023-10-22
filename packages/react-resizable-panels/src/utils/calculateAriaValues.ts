import { PanelData } from "../Panel";
import { getPercentageSizeFromMixedSizes } from "./getPercentageSizeFromMixedSizes";

export function calculateAriaValues({
  groupSizePixels,
  layout,
  panelsArray,
  pivotIndices,
}: {
  groupSizePixels: number;
  layout: number[];
  panelsArray: PanelData[];
  pivotIndices: number[];
}) {
  let currentMinSize = 0;
  let currentMaxSize = 100;
  let totalMinSize = 0;
  let totalMaxSize = 0;

  // A panel's effective min/max sizes also need to account for other panel's sizes.
  panelsArray.forEach((panelData, index) => {
    const { constraints } = panelData;
    const {
      maxSizePercentage,
      maxSizePixels,
      minSizePercentage,
      minSizePixels,
    } = constraints;

    const minSize =
      getPercentageSizeFromMixedSizes(
        {
          sizePercentage: minSizePercentage,
          sizePixels: minSizePixels,
        },
        groupSizePixels
      ) ?? 0;

    const maxSize =
      getPercentageSizeFromMixedSizes(
        {
          sizePercentage: maxSizePercentage,
          sizePixels: maxSizePixels,
        },
        groupSizePixels
      ) ?? 100;

    if (index === pivotIndices[0]) {
      currentMinSize = minSize;
      currentMaxSize = maxSize;
    } else {
      totalMinSize += minSize;
      totalMaxSize += maxSize;
    }
  });

  const valueMax = Math.min(currentMaxSize, 100 - totalMinSize);
  const valueMin = Math.max(currentMinSize, 100 - totalMaxSize);

  const valueNow = layout[pivotIndices[0]];

  return {
    valueMax,
    valueMin,
    valueNow,
  };
}
