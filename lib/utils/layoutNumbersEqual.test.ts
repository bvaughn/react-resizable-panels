import { describe, expect, test } from "vitest";
import { layoutNumbersEqual } from "./layoutNumbersEqual";

describe("layoutNumbersEqual", () => {
  test.each([
    [0, 0, true],
    [-1, -1, true],
    [1, 1, true],
    [0, 1, false],
    [0, -1, false],
    [1, -1, false],
    [-1, 1, false]
  ])("compare: %i, %i -> %o", (a, b, expected) => {
    expect(layoutNumbersEqual(a, b)).toBe(expected);
  });
});
