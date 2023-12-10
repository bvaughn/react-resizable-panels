import { test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { verifyAriaValues } from "./utils/aria";
import { goToUrl } from "./utils/url";

test.describe("Nested groups", () => {
  test("should resize and maintain layouts independently", async ({ page }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, { minSize: 10 }),
        createElement(PanelResizeHandle),
        createElement(
          Panel,
          { minSize: 10 },
          createElement(
            PanelGroup,
            { direction: "vertical" },
            createElement(Panel, { minSize: 10 }),
            createElement(PanelResizeHandle),
            createElement(
              Panel,
              { minSize: 10 },
              createElement(
                PanelGroup,
                { direction: "horizontal" },
                createElement(Panel, { minSize: 10 }),
                createElement(PanelResizeHandle),
                createElement(Panel, { minSize: 10 })
              )
            )
          )
        ),
        createElement(PanelResizeHandle),
        createElement(Panel, { minSize: 10 })
      )
    );

    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const outerHorizontalFirstHandle = resizeHandles.nth(0);
    const verticalHandle = resizeHandles.nth(1);
    const innerHorizontalHandle = resizeHandles.nth(2);
    const outerHorizontalLastHandle = resizeHandles.nth(3);

    // Verify initial values
    await verifyAriaValues(outerHorizontalFirstHandle, {
      min: 10,
      max: 80,
      now: 33,
    });
    await verifyAriaValues(outerHorizontalLastHandle, {
      min: 10,
      max: 80,
      now: 33,
    });
    await verifyAriaValues(verticalHandle, { min: 10, max: 90, now: 50 });
    await verifyAriaValues(innerHorizontalHandle, {
      min: 10,
      max: 90,
      now: 50,
    });

    // Resize the inner panels
    await verticalHandle.focus();
    await page.keyboard.press("Home");
    await innerHorizontalHandle.focus();
    await page.keyboard.press("End");
    await verifyAriaValues(verticalHandle, { now: 10 });
    await verifyAriaValues(innerHorizontalHandle, { now: 90 });

    // Verify the outer panels still have the same relative sizes
    await verifyAriaValues(outerHorizontalFirstHandle, {
      now: 33,
    });
    await verifyAriaValues(outerHorizontalLastHandle, {
      now: 33,
    });

    // Resize the outer panel
    await outerHorizontalFirstHandle.focus();
    await page.keyboard.press("ArrowLeft");
    await verifyAriaValues(outerHorizontalFirstHandle, { now: 23 });
    await outerHorizontalLastHandle.focus();
    await page.keyboard.press("ArrowRight");
    await verifyAriaValues(outerHorizontalLastHandle, { now: 53 });

    // Verify the inner panels still have the same relative sizes
    await verifyAriaValues(verticalHandle, { now: 10 });
    await verifyAriaValues(innerHorizontalHandle, { now: 90 });
  });
});
