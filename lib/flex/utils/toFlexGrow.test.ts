import { describe, expect, test } from "vitest";
import { toFlexGrow } from "./toFlexGrow";

describe("toFlexGrow", () => {
  test("converts percentages to (slightly scaled) fractions", () => {
    expect(toFlexGrow(0)).toBe(0);
    expect(toFlexGrow(40)).toBe(0.4004);
    expect(toFlexGrow(100)).toBe(1.001);
  });

  test("avoids floating point noise", () => {
    expect(toFlexGrow(33.333)).toBe(0.33366);
    expect(toFlexGrow(12.345)).toBe(0.12357);
  });

  test.each([
    [[90.596, 9.404]],
    [[33.334, 33.333, 33.333]],
    [[12.345, 45.678, 41.977]]
  ])("values for a layout of %j add up to at least 1", (layout) => {
    const total = layout.reduce((sum, size) => sum + toFlexGrow(size), 0);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  test("values for a layout missing a panel add up to less than 1", () => {
    expect(toFlexGrow(33.334) + toFlexGrow(33.333)).toBeLessThan(1);
  });
});
