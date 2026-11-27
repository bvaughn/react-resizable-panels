import type { ResizeItemConstraints } from "../types";
import { compareLayoutNumbers } from "./compareLayoutNumbers";

/**
 * Smallest size a collapsed item can be expanded to:
 * its smallest snap size that's within its min/max sizes (if it has one), otherwise its min size.
 */
export function getMinimumExpandedSize({
  maxSize,
  minSize,
  snapSizes = []
}: ResizeItemConstraints): number {
  let minimumSize: number | undefined = undefined;
  for (const size of snapSizes) {
    if (
      compareLayoutNumbers(size, minSize) >= 0 &&
      compareLayoutNumbers(size, maxSize) <= 0 &&
      (minimumSize === undefined || size < minimumSize)
    ) {
      minimumSize = size;
    }
  }

  return minimumSize ?? minSize;
}
