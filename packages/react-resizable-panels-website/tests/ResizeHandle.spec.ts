import { expect, test } from "@playwright/test";

import { verifyAriaValues } from "./utils/aria";

test.describe("Resize handle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1234/examples/horizontal");
  });

  test("should set an 'data-resize-handle-active' attribute when active", async ({
    page,
  }) => {
    const resizeHandle = page.locator("[data-panel-resize-handle-id]").first();
    await expect(
      await resizeHandle.getAttribute("data-resize-handle-active")
    ).toBeNull();

    await resizeHandle.focus();
    await expect(
      await resizeHandle.getAttribute("data-resize-handle-active")
    ).toBe("keyboard");

    await resizeHandle.blur();
    await expect(
      await resizeHandle.getAttribute("data-resize-handle-active")
    ).toBeNull();

    const bounds = await resizeHandle.boundingBox();
    await page.mouse.move(bounds.x, bounds.y);
    await page.mouse.down();
    await expect(
      await resizeHandle.getAttribute("data-resize-handle-active")
    ).toBe("pointer");

    await page.mouse.up();
    await expect(
      await resizeHandle.getAttribute("data-resize-handle-active")
    ).toBeNull();
  });
});
