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
          defaultSize: 35,
          minSize: 10,
        }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel),
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

    await verifyPanelSize(firstPanel, 35);
    await verifyPanelSize(lastPanel, 35);

    await firstHandle.focus();
    await page.keyboard.press("Shift+ArrowLeft");
    await page.keyboard.press("Shift+ArrowLeft");
    await page.keyboard.press("Shift+ArrowLeft");
    await verifyPanelSize(firstPanel, 10);
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
});
