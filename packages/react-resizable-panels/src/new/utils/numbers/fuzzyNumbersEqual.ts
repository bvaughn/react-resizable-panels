import { fuzzyCompareNumbers } from "./fuzzyCompareNumbers";

export function fuzzyNumbersEqual(
  actual: number,
  expected: number,
  fractionDigits?: number
): boolean {
  return fuzzyCompareNumbers(actual, expected, fractionDigits) === 0;
}
