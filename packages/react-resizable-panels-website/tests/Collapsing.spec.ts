import { test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { verifyPanelSizePercentage } from "./utils/panels";
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
          defaultSize: 35,
          minSize: 10,
        }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel, {
          minSize: 10,
        }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel, {
          collapsible: true,
          defaultSize: 35,
          minSize: 20,
        })
      )
    );

    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const firstHandle = resizeHandles.first();
    const lastHandle = resizeHandles.last();

    const panels = page.locator("[data-panel]");
    const firstPanel = panels.first();
    const lastPanel = panels.last();

    await verifyPanelSizePercentage(firstPanel, 35);
    await verifyPanelSizePercentage(lastPanel, 35);

    await firstHandle.focus();
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 25);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 15);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 10);
    // Once it drops below the min size, it will collapse
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 0);
    await page.keyboard.press("ArrowRight");
    await verifyPanelSizePercentage(firstPanel, 10);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 0);
    await page.keyboard.press("ArrowRight");
    await verifyPanelSizePercentage(firstPanel, 10);

    await lastHandle.focus();
    await page.keyboard.press("ArrowRight");
    await verifyPanelSizePercentage(lastPanel, 25);
    await page.keyboard.press("ArrowRight");
    await verifyPanelSizePercentage(lastPanel, 20);
    // Once it drops below the min size, it will collapse
    await page.keyboard.press("ArrowRight");
    await verifyPanelSizePercentage(lastPanel, 0);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(lastPanel, 20);
    await page.keyboard.press("ArrowRight");
    await verifyPanelSizePercentage(lastPanel, 0);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(lastPanel, 20);
  });

  test("should support custom collapsedSize values", async ({ page }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, {
          collapsedSize: 2,
          collapsible: true,
          defaultSize: 35,
          minSize: 10,
        }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel, { minSize: 10 })
      )
    );

    const resizeHandle = page.locator("[data-panel-resize-handle-id]");

    const panels = page.locator("[data-panel]");
    const firstPanel = panels.first();
    const lastPanel = panels.last();

    await verifyPanelSizePercentage(firstPanel, 35);
    await verifyPanelSizePercentage(lastPanel, 65);

    await resizeHandle.focus();
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 25);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 15);
    // Once it drops below min size, it will collapse
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 2);
    await page.keyboard.press("ArrowRight");
    await verifyPanelSizePercentage(firstPanel, 12);
    await page.keyboard.press("ArrowLeft");
    await verifyPanelSizePercentage(firstPanel, 2);
  });
});
