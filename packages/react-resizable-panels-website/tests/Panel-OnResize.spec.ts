import { expect, Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { PanelResizeLogEntry } from "../src/routes/examples/types";

import { clearLogEntries, getLogEntries } from "./utils/debug";
import { goToUrl, updateUrl } from "./utils/url";
import { imperativeResizePanelGroup } from "./utils/panels";

function createElements(numPanels: 2 | 3) {
  const panels = [
    createElement(Panel, {
      collapsible: true,
      defaultSizePercentage: numPanels === 3 ? 20 : 40,
      id: "left",
      minSizePercentage: 10,
      order: 1,
    }),
    createElement(PanelResizeHandle, { id: "left-handle" }),
    createElement(Panel, {
      defaultSizePercentage: 60,
      id: "middle",
      minSizePercentage: 10,
      order: 2,
    }),
  ];

  if (numPanels === 3) {
    panels.push(
      createElement(PanelResizeHandle, { id: "right-handle" }),
      createElement(Panel, {
        collapsible: true,
        defaultSizePercentage: 20,
        id: "right",
        minSizePercentage: 10,
        order: 3,
      })
    );
  }

  return createElement(
    PanelGroup,
    { direction: "horizontal", id: "group" },
    ...panels
  );
}

async function openPage(page: Page) {
  const panelGroup = createElements(3);

  await goToUrl(page, panelGroup);
}

async function verifyEntries(
  page: Page,
  expected: Array<{ panelId: string; sizePercentage: number }>
) {
  const logEntries = await getLogEntries<PanelResizeLogEntry>(page, "onResize");

  expect(logEntries.length).toEqual(expected.length);

  for (let index = 0; index < expected.length; index++) {
    const { panelId: actualPanelId, size: actualSize } = logEntries[index];
    const { panelId: expectedPanelId, sizePercentage: expectedPanelSize } =
      expected[index];

    expect(actualPanelId).toEqual(expectedPanelId);
    expect(actualSize.sizePercentage).toEqual(expectedPanelSize);
  }
}

test.describe("Panel onResize prop", () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page);
  });

  test("should be called once on-mount", async ({ page }) => {
    await verifyEntries(page, [
      { panelId: "left", sizePercentage: 20 },
      { panelId: "middle", sizePercentage: 60 },
      { panelId: "right", sizePercentage: 20 },
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
      { panelId: "left", sizePercentage: 0 },
      { panelId: "middle", sizePercentage: 80 },
    ]);

    await clearLogEntries(page);

    await rightHandle.focus();
    await page.keyboard.press("End");
    await verifyEntries(page, [
      { panelId: "middle", sizePercentage: 100 },
      { panelId: "right", sizePercentage: 0 },
    ]);

    await clearLogEntries(page);

    await page.keyboard.press("Shift+ArrowLeft");
    await verifyEntries(page, [
      { panelId: "middle", sizePercentage: 90 },
      { panelId: "right", sizePercentage: 10 },
    ]);
  });

  test("should be called when triggering PanelGroup setLayout method", async ({
    page,
  }) => {
    await clearLogEntries(page);

    await imperativeResizePanelGroup(page, "group", [10, 20, 70]);

    await verifyEntries(page, [
      { panelId: "left", sizePercentage: 10 },
      { panelId: "middle", sizePercentage: 20 },
      { panelId: "right", sizePercentage: 70 },
    ]);
  });

  test("should be called when a panel is added or removed from the group", async ({
    page,
  }) => {
    await verifyEntries(page, [
      { panelId: "left", sizePercentage: 20 },
      { panelId: "middle", sizePercentage: 60 },
      { panelId: "right", sizePercentage: 20 },
    ]);

    await clearLogEntries(page);

    await updateUrl(page, createElements(2));
    await verifyEntries(page, [{ panelId: "left", sizePercentage: 40 }]);

    await clearLogEntries(page);

    await updateUrl(page, createElements(3));
    await verifyEntries(page, [{ panelId: "left", sizePercentage: 20 }]);
  });
});
