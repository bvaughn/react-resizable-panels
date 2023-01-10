import { expect, Page, test } from "@playwright/test";

import { PanelResizeLogEntry } from "../src/routes/examples/types";

import { clearLogEntries, getLogEntries } from "./utils/debug";

async function verifyEntries(
  page: Page,
  expected: Omit<PanelResizeLogEntry, "type">[]
) {
  const logEntries = await getLogEntries<PanelResizeLogEntry>(page, "onResize");

  expect(logEntries.length).toEqual(expected.length);

  for (let index = 0; index < expected.length; index++) {
    const { panelId: actualPanelId, size: actualSize } = logEntries[index];
    const { panelId: expectedPanelId, size: expectedPanelSize } =
      expected[index];

    expect(actualPanelId).toEqual(expectedPanelId);
    expect(actualSize).toEqual(expectedPanelSize);
  }
}

test.describe("Panel onResize prop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:2345/examples/imperative-api");
  });

  test("should be called once on-mount", async ({ page }) => {
    await verifyEntries(page, [
      { panelId: "left", size: 20 },
      { panelId: "middle", size: 60 },
      { panelId: "right", size: 20 },
    ]);
  });

  test("should be called when panels are resized", async ({ page }) => {
    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const first = resizeHandles.first();
    const last = resizeHandles.last();

    await clearLogEntries(page);

    await first.focus();
    await page.keyboard.press("Home");
    await verifyEntries(page, [
      { panelId: "left", size: 0 },
      { panelId: "middle", size: 80 },
    ]);

    await clearLogEntries(page);

    await last.focus();
    await page.keyboard.press("End");
    await verifyEntries(page, [
      { panelId: "middle", size: 100 },
      { panelId: "right", size: 0 },
    ]);

    await clearLogEntries(page);

    await page.keyboard.press("Shift+ArrowLeft");
    await verifyEntries(page, [
      { panelId: "middle", size: 90 },
      { panelId: "right", size: 10 },
    ]);
  });
});
