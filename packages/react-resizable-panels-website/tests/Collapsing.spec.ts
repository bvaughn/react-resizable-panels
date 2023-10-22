import { test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { verifyPanelSize } from "./utils/panels";
import { goToUrl } from "./utils/url";

test.describe("collapsible prop", () => {
  test("should call onResize when panels are resized", async ({ page }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, {
          collapsible: true,
          defaultSizePercentage: 35,
          minSizePercentage: 10,
        }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel, {
          minSizePercentage: 10,
        }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel, {
          collapsible: true,
          defaultSizePercentage: 35,
          minSizePercentage: 20,
        })
      )
    );

    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const firstHandle = resizeHandles.first();
    const lastHandle = resizeHandles.last();

    const panels = page.locator("[data-panel]");
    const firstPanel = panels.first();
    const lastPanel = panels.last();

    await verifyPanelSize(firstPanel, 35);
    await verifyPanelSize(lastPanel, 35);

    await firstHandle.focus();
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyPanelSize(firstPanel, 25);
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyPanelSize(firstPanel, 15);
    // Once it drops below half, it will collapse
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyPanelSize(firstPanel, 0);
    await page.keyboard.press("Shift+ArrowRight");
    await verifyPanelSize(firstPanel, 10);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSize(firstPanel, 0);
    await page.keyboard.press("ArrowRight");
    await verifyPanelSize(firstPanel, 10);

    await lastHandle.focus();
    await page.keyboard.press("Shift+ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");
    await verifyPanelSize(lastPanel, 20);
    await page.keyboard.press("Shift+ArrowRight");
    await verifyPanelSize(lastPanel, 0);
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyPanelSize(lastPanel, 20);
    await page.keyboard.press("ArrowRight");
    await verifyPanelSize(lastPanel, 0);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSize(lastPanel, 20);
  });

  test("should support custom collapsedSize values", async ({ page }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, {
          collapsedSizePercentage: 2,
          collapsible: true,
          defaultSizePercentage: 35,
          minSizePercentage: 10,
        }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel, { minSizePercentage: 10 })
      )
    );

    const resizeHandle = page.locator("[data-panel-resize-handle-id]");

    const panels = page.locator("[data-panel]");
    const firstPanel = panels.first();
    const lastPanel = panels.last();

    await verifyPanelSize(firstPanel, 35);
    await verifyPanelSize(lastPanel, 65);

    await resizeHandle.focus();
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyPanelSize(firstPanel, 25);
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyPanelSize(firstPanel, 15);
    // Once it drops below half, it will collapse
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyPanelSize(firstPanel, 2);
    await page.keyboard.press("Shift+ArrowRight");
    await verifyPanelSize(firstPanel, 12);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSize(firstPanel, 11);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSize(firstPanel, 10);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSize(firstPanel, 2);
    await page.keyboard.press("ArrowRight");
    await verifyPanelSize(firstPanel, 10);
  });
});
