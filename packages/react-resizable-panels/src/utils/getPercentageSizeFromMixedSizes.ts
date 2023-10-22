import { MixedSizes } from "../types";
import { convertPixelsToPercentage } from "./convertPixelsToPercentage";

export function getPercentageSizeFromMixedSizes(
  { sizePercentage, sizePixels }: Partial<MixedSizes>,
  groupSizePixels: number
): number {
  if (sizePercentage != null) {
    return sizePercentage;
  } else if (sizePixels != null) {
    return convertPixelsToPercentage(sizePixels, groupSizePixels);
  }

  throw Error("Invalid size");
}
