import { Locator, expect } from "@playwright/test";

export async function verifyPanelSize(locator: Locator, expectedSize: number) {
  await expect(await locator.getAttribute("data-panel-size")).toBe(
    expectedSize.toFixed(1)
  );
}
