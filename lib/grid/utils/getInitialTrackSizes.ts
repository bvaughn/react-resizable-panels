import { parseSizeAndUnit } from "../../global/styles/parseSizeAndUnit";
import type { Layout } from "../../global/types";
import type { GridTrackProps } from "../types";

/**
 * Approximates the default layout before the Grid has been mounted (e.g. during server rendering)
 * using the default layout (if one was specified) or the default size of each track.
 */
export function getInitialTrackSizes(
  tracks: (GridTrackProps & { id: string })[],
  defaultLayout: Layout | undefined
): string[] {
  if (defaultLayout) {
    return tracks.map(
      (track) => `minmax(0, ${defaultLayout[track.id] ?? 1}fr)`
    );
  }

  const defaultSizes = tracks.map((track) =>
    track.defaultSize === undefined
      ? undefined
      : parseSizeAndUnit(track.defaultSize)
  );

  let remainingPercentage = 100;
  let numUnspecified = 0;
  defaultSizes.forEach((defaultSize) => {
    if (defaultSize === undefined) {
      numUnspecified++;
    } else if (defaultSize[1] === "%") {
      remainingPercentage -= defaultSize[0];
    }
  });

  return defaultSizes.map((defaultSize) => {
    if (defaultSize === undefined) {
      return `minmax(0, ${Math.max(0, remainingPercentage) / Math.max(1, numUnspecified)}fr)`;
    }

    const [size, unit] = defaultSize;
    return unit === "%" ? `minmax(0, ${size}fr)` : `${size}${unit}`;
  });
}
