import { useCallback } from "../vendor/react";
import { PanelGroupValidateLayout } from "../types";

export function usePanelGroupLayoutValidator({
  collapseBelowPixels,
  maxPixels,
  minPixels,
  position,
}: {
  collapseBelowPixels?: number;
  maxPixels?: number;
  minPixels?: number;
  position: "bottom" | "left" | "right" | "top";
}): PanelGroupValidateLayout {
  return useCallback(
    ({
      availableHeight,
      availableWidth,
      nextSizes,
      prevSizes,
    }: {
      availableHeight: number;
      availableWidth: number;
      nextSizes: number[];
      prevSizes: number[];
    }) => {
      let availablePixels;
      switch (position) {
        case "bottom":
        case "top": {
          availablePixels = availableHeight;
          break;
        }
        case "left":
        case "right": {
          availablePixels = availableWidth;
          break;
        }
      }

      const collapseThresholdSize = collapseBelowPixels
        ? (collapseBelowPixels / availablePixels) * 100
        : null;
      const minSize = minPixels ? (minPixels / availablePixels) * 100 : null;
      const maxSize = maxPixels ? (maxPixels / availablePixels) * 100 : null;

      switch (position) {
        case "left":
        case "top": {
          const firstSize = nextSizes[0];
          const secondSize = nextSizes[1];
          const restSizes = nextSizes.slice(2);

          if (minSize != null && firstSize < minSize) {
            if (
              collapseThresholdSize != null &&
              firstSize < collapseThresholdSize
            ) {
              return [0, secondSize + firstSize, ...restSizes];
            } else if (prevSizes[0] === minSize) {
              // Prevent dragging from resizing other panels
              return prevSizes;
            } else {
              const delta = minSize - firstSize;
              return [minSize, secondSize - delta, ...restSizes];
            }
          } else if (maxSize != null && firstSize > maxSize) {
            if (prevSizes[0] === maxSize) {
              // Prevent dragging from resizing other panels
              return prevSizes;
            } else {
              const delta = firstSize - maxSize;
              return [maxSize, secondSize + delta, ...restSizes];
            }
          } else {
            return nextSizes;
          }
        }
        case "bottom":
        case "right": {
          const lastSize = nextSizes[nextSizes.length - 1];
          const nextButLastSize = nextSizes[nextSizes.length - 2];
          const restSizes = nextSizes.slice(0, nextSizes.length - 2);

          if (minSize != null && lastSize < minSize) {
            if (
              collapseThresholdSize != null &&
              lastSize < collapseThresholdSize
            ) {
              return [...restSizes, nextButLastSize + lastSize, 0];
            } else if (prevSizes[2] === minSize) {
              // Prevent dragging from resizing other panels
              return prevSizes;
            } else {
              const delta = minSize - lastSize;
              return [...restSizes, nextButLastSize - delta, minSize];
            }
          } else if (maxSize != null && lastSize > maxSize) {
            if (prevSizes[2] === maxSize) {
              // Prevent dragging from resizing other panels
              return prevSizes;
            } else {
              const delta = lastSize - maxSize;
              return [...restSizes, nextButLastSize + delta, maxSize];
            }
          } else {
            return nextSizes;
          }
        }
      }
    },
    [collapseBelowPixels, maxPixels, minPixels, position]
  );
}
