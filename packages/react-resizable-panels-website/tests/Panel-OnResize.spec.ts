import { expect, Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { PanelResizeLogEntry } from "../src/routes/examples/types";

import { clearLogEntries, getLogEntries } from "./utils/debug";
import { goToUrl } from "./utils/url";

async function openPage(page: Page) {
  const panelGroup = createElement(
    PanelGroup,
    { direction: "horizontal", id: "group" },
    createElement(Panel, {
      collapsible: true,
      defaultSize: 20,
      id: "left",
      order: 1,
    }),
    createElement(PanelResizeHandle, { id: "left-handle" }),
    createElement(Panel, { defaultSize: 60, id: "middle", order: 2 }),
    createElement(PanelResizeHandle, { id: "right-handle" }),
    createElement(Panel, {
      collapsible: true,
      defaultSize: 20,
      id: "right",
      order: 3,
    })
  );

  await goToUrl(page, panelGroup);
}

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
    await openPage(page);
  });

  test("should be called once on-mount", async ({ page }) => {
    await verifyEntries(page, [
      { panelId: "left", size: 20 },
      { panelId: "middle", size: 60 },
      { panelId: "right", size: 20 },
    ]);
  });

  test("should be called when panels are resized", async ({ page }) => {
    const leftHandle = page.locator(
      '[data-panel-resize-handle-id="left-handle"]'
    );
    const rightHandle = page.locator(
      '[data-panel-resize-handle-id="right-handle"]'
    );

    await clearLogEntries(page);

    await leftHandle.focus();
    await page.keyboard.press("Home");
    await verifyEntries(page, [
      { panelId: "left", size: 0 },
      { panelId: "middle", size: 80 },
    ]);

    await clearLogEntries(page);

    await rightHandle.focus();
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

  test("should be called when triggering PanelGroup setLayout method", async ({
    page,
  }) => {
    await clearLogEntries(page);

    const panelGroupIdInput = page.locator("#panelGroupIdInput");
    const setLayoutButton = page.locator("#setLayoutButton");
    const layoutInput = page.locator("#layoutInput");

    await panelGroupIdInput.focus();
    await panelGroupIdInput.fill("group");

    await layoutInput.focus();
    await layoutInput.fill("[10, 20, 70]");
    await setLayoutButton.click();

    await verifyEntries(page, [
      { panelId: "left", size: 10 },
      { panelId: "middle", size: 20 },
      { panelId: "right", size: 70 },
    ]);
  });
});
