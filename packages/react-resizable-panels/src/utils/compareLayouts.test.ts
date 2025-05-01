import { describe, expect, test } from "vitest";
import { compareLayouts } from "./compareLayouts";

describe("compareLayouts", () => {
  test("should work", () => {
    expect(compareLayouts([1, 2], [1])).toBe(false);
    expect(compareLayouts([1], [1, 2])).toBe(false);
    expect(compareLayouts([1, 2, 3], [1, 2, 3])).toBe(true);
  });
});
