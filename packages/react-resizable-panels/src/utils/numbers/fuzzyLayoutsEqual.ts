import { fuzzyNumbersEqual } from "./fuzzyNumbersEqual";

export function fuzzyLayoutsEqual(
  actual: number[],
  expected: number[],
  fractionDigits?: number
): boolean {
  if (actual.length !== expected.length) {
    return false;
  }

  for (let index = 0; index < actual.length; index++) {
    const actualSize = actual[index] as number;
    const expectedSize = expected[index] as number;

    if (!fuzzyNumbersEqual(actualSize, expectedSize, fractionDigits)) {
      return false;
    }
  }

  return true;
}
