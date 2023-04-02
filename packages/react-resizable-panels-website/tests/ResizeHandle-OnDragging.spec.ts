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
    createElement(PanelResizeHandle, { id: "left-handle" }),
    createElement(Panel, { defaultSize: 60, order: 2 }),
    createElement(PanelResizeHandle, { id: "right-handle" }),
    createElement(Panel, { collapsible: true, defaultSize: 20, order: 3 })
  );

  await goToUrl(page, panelGroup);
}

async function verifyEntries(
  page: Page,
  expected: Array<[handleId: string, isDragging: boolean]>
) {
  const logEntries = await getLogEntries<PanelResizeHandleDraggingLogEntry>(
    page,
    "onDragging"
  );

  expect(logEntries.length).toEqual(expected.length);

  for (let index = 0; index < expected.length; index++) {
    const { isDragging: isDraggingActual, resizeHandleId: handleIdActual } =
      logEntries[index];
    const [handleIdExpected, isDraggingExpected] = expected[index];
    expect(handleIdExpected).toEqual(handleIdActual);
    expect(isDraggingExpected).toEqual(isDraggingActual);
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
    const leftHandle = page.locator(
      '[data-panel-resize-handle-id="left-handle"]'
    );
    const rightHandle = page.locator(
      '[data-panel-resize-handle-id="right-handle"]'
    );

    await clearLogEntries(page, "onDragging");

    let bounds = (await leftHandle.boundingBox())!;
    await page.mouse.move(bounds.x, bounds.y);
    await page.mouse.down();
    await page.mouse.move(5, 0);
    await page.mouse.move(10, 0);
    await page.mouse.move(15, 0);
    await verifyEntries(page, [["left-handle", true]]);

    await page.mouse.up();
    await verifyEntries(page, [
      ["left-handle", true],
      ["left-handle", false],
    ]);

    await clearLogEntries(page, "onDragging");

    bounds = (await rightHandle.boundingBox())!;
    await page.mouse.move(bounds.x, bounds.y);
    await page.mouse.down();
    await page.mouse.move(25, 0);
    await verifyEntries(page, [["right-handle", true]]);

    await page.mouse.up();
    await verifyEntries(page, [
      ["right-handle", true],
      ["right-handle", false],
    ]);
  });
});
