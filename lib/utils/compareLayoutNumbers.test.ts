import { describe, expect, test } from "vitest";
import { compareLayoutNumbers } from "./compareLayoutNumbers";

describe("compareLayoutNumbers", () => {
  test.each([
    [0, 0, 0],
    [0, 1, -1],
    [0, 25, -1],
    [50, 100, -1],
    [0, -1, 1],
    [50, 25, 1],
    [-50, -100, 1]
  ])("compare: %i, %i -> %i", (a, b, expected) => {
    expect(compareLayoutNumbers(a, b)).toBe(expected);
  });
});
