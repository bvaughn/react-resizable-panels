import { describe, expect, test } from "vitest";
import { isExplicitId } from "./isExplicitId";

describe("isExplicitId", () => {
  test("should work", () => {
    expect(isExplicitId("id")).toBe(true);
    expect(isExplicitId(0)).toBe(true);
    expect(isExplicitId(1)).toBe(true);

    expect(isExplicitId("")).toBe(false);
    expect(isExplicitId(undefined)).toBe(false);
    expect(isExplicitId(null)).toBe(false);
  });
});
