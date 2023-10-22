import { expect, Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import {
  PanelCollapseLogEntry,
  PanelExpandLogEntry,
} from "../src/routes/examples/types";

import { clearLogEntries, getLogEntries } from "./utils/debug";
import { imperativeResizePanelGroup } from "./utils/panels";
import { goToUrl } from "./utils/url";

async function openPage(
  page: Page,
  options: {
    collapsedByDefault?: boolean;
    middleCollapsible?: boolean;
  } = {}
) {
  const { collapsedByDefault = false, middleCollapsible = true } = options;

  const panelGroup = createElement(
    PanelGroup,
    { direction: "horizontal", id: "group" },
    createElement(Panel, {
      collapsible: true,
      defaultSizePercentage: collapsedByDefault ? 0 : 20,
      id: "left",
      minSizePercentage: 10,
      order: 1,
    }),
    createElement(PanelResizeHandle, { id: "left-handle" }),
    createElement(Panel, {
      collapsible: middleCollapsible,
      id: "middle",
      minSizePercentage: 10,
      order: 2,
    }),
    createElement(PanelResizeHandle, { id: "right-handle" }),
    createElement(Panel, {
      collapsible: true,
      defaultSizePercentage: collapsedByDefault ? 0 : 20,
      id: "right",
      minSizePercentage: 10,
      order: 3,
    })
  );

  await goToUrl(page, panelGroup);
}

async function verifyEntries(
  page: Page,
  expected: Array<{ panelId: string; collapsed: boolean }>
) {
  const logEntries = await getLogEntries<
    PanelCollapseLogEntry | PanelExpandLogEntry
  >(page, ["onCollapse", "onExpand"]);

  try {
    expect(logEntries.length).toEqual(expected.length);
  } catch (error) {
    console.error(`Expected ${expected.length} entries, got:\n`, logEntries);
    throw error;
  }

  for (let index = 0; index < expected.length; index++) {
    const { panelId: actualPanelId, type } = logEntries[index];
    const { panelId: expectedPanelId, collapsed: expectedPanelCollapsed } =
      expected[index];

    const actualPanelCollapsed = type === "onCollapse";

    expect(actualPanelId).toEqual(expectedPanelId);
    expect(actualPanelCollapsed).toEqual(expectedPanelCollapsed);
  }
}

test.describe("Panel onCollapse prop", () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page);
  });

  test("should be called once on-mount", async ({ page }) => {
    // No panels are collapsed by default.
    await verifyEntries(page, [
      { panelId: "left", collapsed: false },
      { panelId: "middle", collapsed: false },
      { panelId: "right", collapsed: false },
    ]);

    // If we override via URL parameters, left and right panels should be collapsed by default.
    await openPage(page, { collapsedByDefault: true });
    await verifyEntries(page, [
      { panelId: "left", collapsed: true },
      { panelId: "middle", collapsed: false },
      { panelId: "right", collapsed: true },
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

    // Resizing should not trigger onCollapse unless the panel's collapsed state changes.
    await leftHandle.focus();
    await page.keyboard.press("ArrowLeft");
    await verifyEntries(page, []);

    await page.keyboard.press("Home");
    await verifyEntries(page, [{ panelId: "left", collapsed: true }]);

    await clearLogEntries(page);

    await rightHandle.focus();
    await page.keyboard.press("End");
    await verifyEntries(page, [{ panelId: "right", collapsed: true }]);

    await clearLogEntries(page);

    // Resizing should not trigger onCollapse unless the panel's collapsed state changes.
    await page.keyboard.press("ArrowRight");
    await verifyEntries(page, []);

    await page.keyboard.press("ArrowLeft");
    await verifyEntries(page, [{ panelId: "right", collapsed: false }]);
  });

  test("should be called when triggering PanelGroup setLayout method", async ({
    page,
  }) => {
    await clearLogEntries(page);

    await imperativeResizePanelGroup(page, "group", ["70%", "30%", "0%"]);
    await verifyEntries(page, [{ panelId: "right", collapsed: true }]);

    await clearLogEntries(page);

    await imperativeResizePanelGroup(page, "group", ["0%", "0%", "100%"]);
    await verifyEntries(page, [
      { panelId: "left", collapsed: true },
      { panelId: "middle", collapsed: true },
      { panelId: "right", collapsed: false },
    ]);
  });
});
