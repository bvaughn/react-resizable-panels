import { objectsEqual } from "./objectsEqual";
import type { ResizeItemConstraints } from "../types";

export function itemConstraintsEqual(
  a: ResizeItemConstraints[],
  b: ResizeItemConstraints[]
) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((current, index) => {
    const { snapSizes: snapSizesA = [], ...restA } = current;
    const { snapSizes: snapSizesB = [], ...restB } = b[index];

    return (
      objectsEqual(restA, restB) &&
      snapSizesA.length === snapSizesB.length &&
      snapSizesA.every((size, sizeIndex) => size === snapSizesB[sizeIndex])
    );
  });
}
