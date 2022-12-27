import { Locator, Page, test, expect } from "@playwright/test";

async function verifyAriaValues(
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

// https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
test.describe("Window Splitter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1234/examples/horizontal");
  });

  test("display the correct initial ARIA value attributes", async ({
    page,
  }) => {
    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    await verifyAriaValues(resizeHandles.first(), {
      min: 20,
      max: 50,
      now: 20,
    });
    await verifyAriaValues(resizeHandles.last(), {
      min: 30,
      max: 60,
      now: 60,
    });
  });

  test("implements arrow key functionality", async ({ page }) => {
    let resizeHandle = page.locator("[data-panel-resize-handle-id]").first();
    await resizeHandle.focus();

    await page.keyboard.press("ArrowRight");
    await verifyAriaValues(resizeHandle, {
      now: 21,
    });

    await page.keyboard.press("ArrowRight");
    await verifyAriaValues(resizeHandle, {
      now: 22,
    });

    // This isn't officially part of the spec but it seems like a nice tweak
    await page.keyboard.press("Shift+ArrowRight");
    await verifyAriaValues(resizeHandle, {
      now: 32,
    });

    await page.keyboard.press("ArrowLeft");
    await verifyAriaValues(resizeHandle, {
      now: 31,
    });

    // This isn't officially part of the spec but it seems like a nice tweak
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyAriaValues(resizeHandle, {
      now: 21,
    });

    // Up and down arrows should not affect a "horizontal" list
    await page.keyboard.press("ArrowUp");
    await verifyAriaValues(resizeHandle, {
      now: 21,
    });
    await page.keyboard.press("ArrowDown");
    await verifyAriaValues(resizeHandle, {
      now: 21,
    });

    await page.goto("http://localhost:1234/examples/vertical");

    resizeHandle = page.locator("[data-panel-resize-handle-id]").first();
    await resizeHandle.focus();

    await verifyAriaValues(resizeHandle, {
      min: 10,
      max: 90,
      now: 50,
    });

    // Up and down arrows should affect a "vertical" list
    await page.keyboard.press("ArrowUp");
    await verifyAriaValues(resizeHandle, {
      now: 49,
    });
    await page.keyboard.press("Shift+ArrowDown");
    await verifyAriaValues(resizeHandle, {
      now: 59,
    });

    // But Left and right arrows should be ignored
    await page.keyboard.press("ArrowLeft");
    await verifyAriaValues(resizeHandle, {
      now: 59,
    });
    await page.keyboard.press("ArrowRight");
    await verifyAriaValues(resizeHandle, {
      now: 59,
    });
  });

  test("implements Enter key functionality", async ({ page }) => {
    const resizeHandle = page.locator("[data-panel-resize-handle-id]").first();
    await resizeHandle.focus();

    await page.keyboard.press("ArrowRight");
    await verifyAriaValues(resizeHandle, {
      min: 20,
      max: 50,
      now: 21,
    });

    await page.keyboard.press("Enter");
    await verifyAriaValues(resizeHandle, {
      min: 20,
      max: 50,
      now: 20,
    });

    await page.keyboard.press("Enter");
    await verifyAriaValues(resizeHandle, {
      min: 20,
      max: 50,
      now: 50,
    });
  });

  test("implements optional Home and End key functionality", async ({
    page,
  }) => {
    const resizeHandle = page.locator("[data-panel-resize-handle-id]").first();
    await resizeHandle.focus();

    await page.keyboard.press("End");
    await verifyAriaValues(resizeHandle, {
      min: 20,
      max: 50,
      now: 50,
    });

    await page.keyboard.press("Home");
    await verifyAriaValues(resizeHandle, {
      min: 20,
      max: 50,
      now: 20,
    });
  });

  test("implements optional F6 key functionality", async ({ page }) => {
    const resizeHandles = page.locator("[data-panel-resize-handle-id]");

    await resizeHandles.first().focus();
    await expect(resizeHandles.first()).toBeFocused();

    // Should be focused on the next (last) resize handle
    await page.keyboard.press("F6");
    await expect(resizeHandles.last()).toBeFocused();

    // Should be focused on the next (first) resize handle
    await page.keyboard.press("F6");
    await expect(resizeHandles.first()).toBeFocused();
  });
});
