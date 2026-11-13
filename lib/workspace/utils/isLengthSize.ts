import { parseSizeAndUnit } from "../../global/styles/parseSizeAndUnit";

/**
 * Whether a node's size is a length (e.g. "300px" or "20rem"), rather than a percentage (a number, or a string without an absolute unit).
 */
export function isLengthSize(
  size: number | string | undefined
): size is string {
  if (typeof size !== "string") {
    return false;
  }

  const [numeric, unit] = parseSizeAndUnit(size);

  return unit !== "%" && Number.isFinite(numeric) && numeric >= 0;
}
