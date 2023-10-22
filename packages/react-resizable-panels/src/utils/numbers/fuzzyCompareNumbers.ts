import { PRECISION } from "../../constants";

export function fuzzyCompareNumbers(
  actual: number,
  expected: number,
  fractionDigits: number = PRECISION
): number {
  actual = parseFloat(actual.toFixed(fractionDigits));
  expected = parseFloat(expected.toFixed(fractionDigits));

  const delta = actual - expected;
  if (delta === 0) {
    return 0;
  } else {
    return delta > 0 ? 1 : -1;
  }
}
