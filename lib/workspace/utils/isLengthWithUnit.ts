// Whether a size is a string with a unit other than % (e.g. "200px"); other strings (e.g. "abc" or "30 %") are not
export function isLengthWithUnit(size: unknown): size is string {
  return (
    typeof size === "string" && /^\s*\d*\.?\d+(px|em|rem|vh|vw)\s*$/.test(size)
  );
}
