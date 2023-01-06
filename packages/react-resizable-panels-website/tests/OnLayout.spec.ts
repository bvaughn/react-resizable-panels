import { expect, test } from "@playwright/test";

test.describe("PanelGroup onLayout prop", () => {
  test("should call onLayout when group is resized", async ({ page }) => {
    await page.goto("http://localhost:2345/examples/external-persistence");

    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const first = resizeHandles.first();
    const last = resizeHandles.last();

    await first.focus();
    await page.keyboard.press("Home");
    await last.focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Shift+ArrowLeft");

    // Wait for test harness debounce
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    const expectedSizes = {
      left: 0,
      middle: 90,
      right: 10,
    };

    expect(page.url()).toContain(
      "#" + encodeURI(JSON.stringify(expectedSizes))
    );
  });
});
