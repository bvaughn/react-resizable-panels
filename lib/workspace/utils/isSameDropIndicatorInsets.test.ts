import { describe, expect, test } from "vitest";
import { isSameDropIndicatorInsets } from "./isSameDropIndicatorInsets";

describe("isSameDropIndicatorInsets", () => {
  const insets = { bottom: 1, left: 2, right: 3, top: 4 };

  test("compares every inset", () => {
    expect(isSameDropIndicatorInsets(insets, { ...insets })).toBe(true);
    expect(isSameDropIndicatorInsets(insets, { ...insets, bottom: 0 })).toBe(
      false
    );
    expect(isSameDropIndicatorInsets(insets, { ...insets, left: 0 })).toBe(
      false
    );
    expect(isSameDropIndicatorInsets(insets, { ...insets, right: 0 })).toBe(
      false
    );
    expect(isSameDropIndicatorInsets(insets, { ...insets, top: 0 })).toBe(
      false
    );
  });

  test("handles missing insets", () => {
    expect(isSameDropIndicatorInsets(undefined, undefined)).toBe(true);
    expect(isSameDropIndicatorInsets(undefined, insets)).toBe(false);
    expect(isSameDropIndicatorInsets(insets, undefined)).toBe(false);
  });
});
