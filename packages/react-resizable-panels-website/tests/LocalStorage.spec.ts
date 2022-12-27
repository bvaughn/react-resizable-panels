import { test, expect } from "@playwright/test";

import { verifyAriaValues } from "./utils/aria";

test.describe("localStorage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1234/examples/conditional");
  });

  test("should restore previous layout if autoSaveId prop has been provided", async ({
    page,
  }) => {
    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    await verifyAriaValues(resizeHandles.first(), {
      min: 10,
      max: 80,
      now: 33,
    });
    await verifyAriaValues(resizeHandles.last(), {
      min: 10,
      max: 80,
      now: 33,
    });

    await resizeHandles.first().focus();
    await page.keyboard.press("Home");
    await resizeHandles.last().focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyAriaValues(resizeHandles.first(), {
      now: 10,
    });
    await verifyAriaValues(resizeHandles.last(), {
      now: 70,
    });

    // Values should be remembered after a page reload
    await page.reload();
    await verifyAriaValues(resizeHandles.first(), {
      now: 10,
    });
    await verifyAriaValues(resizeHandles.last(), {
      now: 70,
    });
  });

  test("should store layouts separately per panel combination", async ({
    page,
  }) => {
    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    await verifyAriaValues(resizeHandles.first(), {
      now: 33,
    });
    await verifyAriaValues(resizeHandles.last(), {
      now: 33,
    });

    // Show only the right panel and then resize things
    await page.locator("#toggleLeftPanelButton").click();
    await resizeHandles.first().focus();
    await page.keyboard.press("Home");
    await verifyAriaValues(resizeHandles.first(), {
      now: 10,
    });

    // Show only the left panel and then resize things
    await page.locator("#toggleLeftPanelButton").click();
    await page.locator("#toggleRightPanelButton").click();
    await resizeHandles.first().focus();
    await page.keyboard.press("End");
    await verifyAriaValues(resizeHandles.first(), {
      now: 90,
    });

    // Reload and verify all of the different layouts are remembered individually
    await page.reload();
    await verifyAriaValues(resizeHandles.first(), {
      now: 33,
    });
    await verifyAriaValues(resizeHandles.last(), {
      now: 33,
    });
    await page.locator("#toggleLeftPanelButton").click();
    await verifyAriaValues(resizeHandles.first(), {
      now: 10,
    });
    await page.locator("#toggleLeftPanelButton").click();
    await page.locator("#toggleRightPanelButton").click();
    await verifyAriaValues(resizeHandles.first(), {
      now: 90,
    });
  });
});
