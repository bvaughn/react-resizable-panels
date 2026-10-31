import { describe, expect, test } from "vitest";
import { isArrayEqual } from "./isArrayEqual";

describe("isArrayEqual", () => {
  test("should work", () => {
    expect(isArrayEqual([1, 2], [1])).toBe(false);
    expect(isArrayEqual([1], [1, 2])).toBe(false);
    expect(isArrayEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });
});
