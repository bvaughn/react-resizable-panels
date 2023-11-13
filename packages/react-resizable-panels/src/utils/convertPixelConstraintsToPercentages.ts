import { PanelConstraints } from "../Panel";
import { convertPixelsToPercentage } from "./convertPixelsToPercentage";

export function convertPixelConstraintsToPercentages(
  panelConstraints: PanelConstraints,
  groupSizePixels: number
): {
  collapsedSizePercentage: number;
  defaultSizePercentage: number | undefined;
  maxSizePercentage: number;
  minSizePercentage: number;
} {
  let {
    collapsedSizePercentage = 0,
    collapsedSizePixels,
    defaultSizePercentage,
    defaultSizePixels,
    maxSizePercentage = 100,
    maxSizePixels,
    minSizePercentage = 0,
    minSizePixels,
  } = panelConstraints;

  const hasPixelConstraints =
    collapsedSizePixels != null ||
    defaultSizePixels != null ||
    minSizePixels != null ||
    maxSizePixels != null;

  if (hasPixelConstraints && groupSizePixels <= 0) {
    console.warn(`WARNING: Invalid group size: ${groupSizePixels}px`);

    return {
      collapsedSizePercentage: 0,
      defaultSizePercentage,
      maxSizePercentage: 0,
      minSizePercentage: 0,
    };
  }

  if (collapsedSizePixels != null) {
    collapsedSizePercentage = convertPixelsToPercentage(
      collapsedSizePixels,
      groupSizePixels
    );
  }
  if (defaultSizePixels != null) {
    defaultSizePercentage = convertPixelsToPercentage(
      defaultSizePixels,
      groupSizePixels
    );
  }
  if (minSizePixels != null) {
    minSizePercentage = convertPixelsToPercentage(
      minSizePixels,
      groupSizePixels
    );
  }
  if (maxSizePixels != null) {
    maxSizePercentage = convertPixelsToPercentage(
      maxSizePixels,
      groupSizePixels
    );
  }

  return {
    collapsedSizePercentage,
    defaultSizePercentage,
    maxSizePercentage,
    minSizePercentage,
  };
}
