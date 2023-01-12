import { expect, Page, test } from "@playwright/test";

import { PanelGroupLayoutLogEntry } from "../src/routes/examples/types";

import { clearLogEntries, getLogEntries } from "./utils/debug";

async function verifyEntries(page: Page, expectedSizes: number[][]) {
  const logEntries = await getLogEntries<PanelGroupLayoutLogEntry>(
    page,
    "onLayout"
  );

  expect(logEntries.length).toEqual(expectedSizes.length);

  for (let index = 0; index < expectedSizes.length; index++) {
    const actual = logEntries[index].sizes;
    const expected = expectedSizes[index];
    expect(actual).toEqual(expected);
  }
}

test.describe("PanelGroup onLayout prop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:2345/examples/imperative-api?onLayout");
  });

  test("should be called once on-mount", async ({ page }) => {
    await verifyEntries(page, [[20, 60, 20]]);
  });

  test("should be called when the panel group is resized", async ({ page }) => {
    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const first = resizeHandles.first();
    const last = resizeHandles.last();

    await clearLogEntries(page, "onLayout");

    await first.focus();
    await page.keyboard.press("Home");
    await last.focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Shift+ArrowLeft");

    await verifyEntries(page, [
      [0, 80, 20],
      [0, 100, 0],
      [0, 90, 10],
    ]);
  });
});
