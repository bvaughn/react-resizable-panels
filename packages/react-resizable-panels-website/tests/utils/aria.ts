import { Locator, expect } from "@playwright/test";

export async function verifyAriaValues(
  locator: Locator,
  expectedValues: { max?: number; min?: number; now?: number }
) {
  const { max, min, now } = expectedValues;

  if (max != null) {
    await expect(await locator.getAttribute("aria-valuemax")).toBe("" + max);
  }
  if (min != null) {
    await expect(await locator.getAttribute("aria-valuemin")).toBe("" + min);
  }
  if (now != null) {
    await expect(await locator.getAttribute("aria-valuenow")).toBe("" + now);
  }
}
