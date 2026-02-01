import { describe, expect, test } from "vitest";
import { formatLayoutNumber } from "./formatLayoutNumber";

describe("formatLayoutNumber", () => {
  test.each([
    [0, 0],
    [0.1, 0.1],
    [0.12, 0.12],
    [0.123, 0.123],
    [0.123, 0.123],
    [0.5551, 0.555],
    [0.5559, 0.556],
    [-0.1, -0.1],
    [-0.12, -0.12],
    [-0.123, -0.123],
    [-0.123, -0.123],
    [-0.1234, -0.123],
    [-0.5551, -0.555],
    [-0.5559, -0.556]
  ])("format: %i -> %i", (input, expected) => {
    expect(formatLayoutNumber(input)).toBe(expected);
  });
});
