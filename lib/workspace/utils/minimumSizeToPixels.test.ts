import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetWarnOnceForTest } from "../../shared/utils/warnOnce";
import { minimumSizeToPixels } from "./minimumSizeToPixels";

describe("minimumSizeToPixels", () => {
  beforeEach(() => {
    resetWarnOnceForTest();
  });

  test("converts absolute units", () => {
    expect(minimumSizeToPixels(undefined, null)).toBe(0);
    expect(minimumSizeToPixels("200px", null)).toBe(200);
  });

  test("warns about percentages and numbers", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(minimumSizeToPixels("25%", null)).toBe(0);
    expect(minimumSizeToPixels("25", null)).toBe(0);
    expect(minimumSizeToPixels(200 as unknown as string, null)).toBe(0);
    expect(warn).toHaveBeenCalledTimes(3);

    warn.mockRestore();
  });
});
