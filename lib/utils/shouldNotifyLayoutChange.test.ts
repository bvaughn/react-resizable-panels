import { describe, expect, test } from "vitest";
import { shouldNotifyLayoutChange } from "./shouldNotifyLayoutChange";

describe("shouldNotifyLayoutChange", () => {
  test("returns true when layouts match", () => {
    expect(shouldNotifyLayoutChange({ a: 50 }, { a: 50 })).toBe(true);
  });

  test("returns false when layouts differ", () => {
    expect(shouldNotifyLayoutChange({ a: 50 }, { a: 45 })).toBe(false);
  });
});
