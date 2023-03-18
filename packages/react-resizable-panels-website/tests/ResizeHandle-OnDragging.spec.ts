import { expect, Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { PanelResizeHandleDraggingLogEntry } from "../src/routes/examples/types";

import { clearLogEntries, getLogEntries } from "./utils/debug";
import { goToUrl } from "./utils/url";

async function openPage(page: Page) {
  const panelGroup = createElement(
    PanelGroup,
    { direction: "horizontal", id: "group" },
    createElement(Panel, { collapsible: true, defaultSize: 20, order: 1 }),
    createElement(PanelResizeHandle, { id: "handle" }),
    createElement(Panel, { collapsible: true, defaultSize: 20, order: 3 })
  );

  await goToUrl(page, panelGroup);
}

async function verifyEntries(page: Page, expectedIsDragging: boolean[]) {
  const logEntries = await getLogEntries<PanelResizeHandleDraggingLogEntry>(
    page,
    "onDragging"
  );

  expect(logEntries.length).toEqual(expectedIsDragging.length);

  for (let index = 0; index < expectedIsDragging.length; index++) {
    const actual = logEntries[index].isDragging;
    const expected = expectedIsDragging[index];
    expect(actual).toEqual(expected);
  }
}

test.describe("PanelResizeHandle onDragging prop", () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page);
  });

  test("should not be called on-mount", async ({ page }) => {
    await verifyEntries(page, []);
  });

  test("should be called when the panel ResizeHandle starts or stops resizing", async ({
    page,
  }) => {
    const handle = page.locator('[data-panel-resize-handle-id="handle"]');

    await clearLogEntries(page, "onDragging");

    const bounds = await handle.boundingBox();
    await page.mouse.move(bounds.x, bounds.y);
    await page.mouse.down();
    await page.mouse.move(5, 0);
    await page.mouse.move(10, 0);
    await page.mouse.move(15, 0);

    await verifyEntries(page, [true]);

    await page.mouse.up();

    await verifyEntries(page, [true, false]);
  });
});
