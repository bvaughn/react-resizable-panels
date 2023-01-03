import { expect, Page, test } from "@playwright/test";

import { verifyAriaValues } from "./utils/aria";

async function verifySizes(
  page: Page,
  expectedSizeLeft: number,
  expectedSizeMiddle: number,
  expectedSizeRight: number
) {
  const panels = page.locator("[data-panel-id]");
  await expect(await panels.nth(0).textContent()).toBe(
    `left: ${expectedSizeLeft}`
  );
  await expect(await panels.nth(1).textContent()).toBe(
    `middle: ${expectedSizeMiddle}`
  );
  await expect(await panels.nth(2).textContent()).toBe(
    `right: ${expectedSizeRight}`
  );
}

test.describe("onResize prop", () => {
  test("should call onResize when panels are resized", async ({ page }) => {
    await page.goto("http://localhost:2345/examples/external-persistence");

    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const first = resizeHandles.first();
    const last = resizeHandles.last();

    await verifySizes(page, 33, 34, 33);

    await first.focus();
    await page.keyboard.press("Home");
    await last.focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Shift+ArrowLeft");
    await verifySizes(page, 0, 90, 10);
  });
});
