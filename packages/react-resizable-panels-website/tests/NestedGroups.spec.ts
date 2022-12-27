import { Locator, test } from "@playwright/test";

import { verifyAriaValues } from "./utils/aria";

test.describe("Nested groups", () => {
  let outerHorizontalFirstHandle: Locator;
  let outerHorizontalLastHandle: Locator;
  let verticalHandle: Locator;
  let innerHorizontalHandle: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1234/examples/nested");

    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    outerHorizontalFirstHandle = resizeHandles.nth(0);
    outerHorizontalLastHandle = resizeHandles.nth(3);
    verticalHandle = resizeHandles.nth(1);
    innerHorizontalHandle = resizeHandles.nth(2);
  });

  test("should resize and maintain layouts independently", async ({ page }) => {
    // Verify initial values
    await verifyAriaValues(outerHorizontalFirstHandle, {
      min: 10,
      max: 55,
      now: 20,
    });
    await verifyAriaValues(outerHorizontalLastHandle, {
      min: 35,
      max: 80,
      now: 60,
    });
    await verifyAriaValues(verticalHandle, { min: 10, max: 90, now: 35 });
    await verifyAriaValues(innerHorizontalHandle, {
      min: 10,
      max: 90,
      now: 50,
    });

    // Resize the inner panels
    await verticalHandle.focus();
    await page.keyboard.press("Home");
    await innerHorizontalHandle.focus();
    await page.keyboard.press("End");
    await verifyAriaValues(verticalHandle, { now: 10 });
    await verifyAriaValues(innerHorizontalHandle, { now: 90 });

    // Resize the outer panel
    await outerHorizontalFirstHandle.focus();
    await page.keyboard.press("Home");
    await outerHorizontalLastHandle.focus();
    await page.keyboard.press("End");

    // Verify the inner panels still have the same relative sizes
    await verifyAriaValues(verticalHandle, { now: 10 });
    await verifyAriaValues(innerHorizontalHandle, { now: 90 });
  });
});
