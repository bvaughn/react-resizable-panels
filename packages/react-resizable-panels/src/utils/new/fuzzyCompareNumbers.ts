export function fuzzyCompareNumbers(
  actual: number,
  expected: number,
  fractionDigits: number = 3
) {
  return actual.toFixed(fractionDigits) === expected.toFixed(fractionDigits);
}
