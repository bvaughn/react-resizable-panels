import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { sizeToPixels } from "./sizeToPixels";

describe("sizeToPixels", () => {
  beforeEach(() => {
    resetWarnOnceForTest();
  });

  test("converts absolute units", () => {
    expect(sizeToPixels(undefined, null)).toBeUndefined();
    expect(sizeToPixels("200px", null)).toBe(200);
  });

  test("can't convert relative units without an element", () => {
    expect(sizeToPixels("12rem", null)).toBeUndefined();
  });

  test("warns about percentages and numbers", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(sizeToPixels("25%", null)).toBeUndefined();
    expect(sizeToPixels("25", null)).toBeUndefined();
    expect(sizeToPixels(200 as unknown as string, null)).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(3);

    warn.mockRestore();
  });
});
