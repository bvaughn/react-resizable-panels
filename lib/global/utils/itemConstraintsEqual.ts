import { objectsEqual } from "./objectsEqual";
import type { ResizeItemConstraints } from "../types";

export function itemConstraintsEqual(
  a: ResizeItemConstraints[],
  b: ResizeItemConstraints[]
) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((current, index) => objectsEqual(current, b[index]));
}
