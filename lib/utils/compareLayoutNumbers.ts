import { layoutNumbersEqual } from "./layoutNumbersEqual";

export function compareLayoutNumbers(actual: number, expected: number) {
  if (layoutNumbersEqual(actual, expected)) {
    return 0;
  } else {
    return actual > expected ? 1 : -1;
  }
}
