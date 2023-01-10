import { Page, expect, test } from "@playwright/test";

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

test.describe("Imperative Panel API", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:2345/examples/imperative-api");
  });

  test("should resize panels within min/max boundaries", async ({ page }) => {
    await verifySizes(page, 20, 60, 20);

    const leftInput = page.locator('[data-test-id="size-input-left"]');
    const middleInput = page.locator('[data-test-id="size-input-middle"]');
    const rightInput = page.locator('[data-test-id="size-input-right"]');

    // Left panel
    await leftInput.focus();
    await leftInput.fill("15");
    await page.keyboard.press("Enter");
    await verifySizes(page, 15, 65, 20);

    await leftInput.focus();
    await leftInput.fill("5");
    await page.keyboard.press("Enter");
    await verifySizes(page, 10, 70, 20);

    await leftInput.focus();
    await leftInput.fill("55");
    await page.keyboard.press("Enter");
    await verifySizes(page, 30, 50, 20);

    // Middle panel
    await middleInput.focus();
    await middleInput.fill("15");
    await page.keyboard.press("Enter");
    await verifySizes(page, 30, 15, 55);

    await middleInput.focus();
    await middleInput.fill("5");
    await page.keyboard.press("Enter");
    await verifySizes(page, 30, 10, 60);

    // Right panel
    await rightInput.focus();
    await rightInput.fill("15");
    await page.keyboard.press("Enter");
    await verifySizes(page, 30, 55, 15);

    await rightInput.focus();
    await rightInput.fill("5");
    await page.keyboard.press("Enter");
    await verifySizes(page, 30, 60, 10);
  });

  test("should expand imperatively collapsed panels to size before collapse", async ({
    page,
  }) => {
    const leftInput = page.locator('[data-test-id="size-input-left"]');
    const rightInput = page.locator('[data-test-id="size-input-right"]');

    await leftInput.focus();
    await leftInput.fill("15");
    await page.keyboard.press("Enter");
    await rightInput.fill("25");
    await page.keyboard.press("Enter");
    await verifySizes(page, 15, 60, 25);

    const leftCollapseButton = page.locator(
      '[data-test-id="collapse-button-left"]'
    );
    const leftExpandButton = page.locator(
      '[data-test-id="expand-button-left"]'
    );
    const rightCollapseButton = page.locator(
      '[data-test-id="collapse-button-right"]'
    );
    const rightExpandButton = page.locator(
      '[data-test-id="expand-button-right"]'
    );

    await leftCollapseButton.click();
    await verifySizes(page, 0, 75, 25);

    await leftExpandButton.click();
    await verifySizes(page, 15, 60, 25);

    await rightCollapseButton.click();
    await verifySizes(page, 15, 85, 0);

    await rightExpandButton.click();
    await verifySizes(page, 15, 60, 25);
  });

  test("should expand drag collapsed panels to their most recent size", async ({
    page,
  }) => {
    await verifySizes(page, 20, 60, 20);

    const leftInput = page.locator('[data-test-id="size-input-left"]');
    await leftInput.focus();
    await leftInput.fill("15");
    await page.keyboard.press("Enter");
    await verifySizes(page, 15, 65, 20);

    await leftInput.fill("0");
    await page.keyboard.press("Enter");
    await verifySizes(page, 0, 80, 20);

    const leftExpandButton = page.locator(
      '[data-test-id="expand-button-left"]'
    );
    await leftExpandButton.click();
    await verifySizes(page, 15, 65, 20);
  });

  test("should expand to the panel's minSize if collapsed by default", async ({
    page,
  }) => {
    await page.goto("http://localhost:2345/examples/imperative-api?collapse");

    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const first = resizeHandles.first();
    const last = resizeHandles.last();

    await first.focus();
    await page.keyboard.press("ArrowRight");

    await last.focus();
    await page.keyboard.press("Shift+ArrowLeft");

    await verifySizes(page, 10, 80, 10);
  });
});
