import { formatLayoutNumber } from "./formatLayoutNumber";

export function layoutNumbersEqual(
  actual: number,
  expected: number,
  minimumDelta = 0
) {
  return (
    Math.abs(formatLayoutNumber(actual) - formatLayoutNumber(expected)) <=
    minimumDelta
  );
}
