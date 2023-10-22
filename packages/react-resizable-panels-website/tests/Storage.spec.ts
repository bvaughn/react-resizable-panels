import { test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { verifyAriaValues } from "./utils/aria";
import { goToUrl } from "./utils/url";

const panelGroupABC = createElement(
  PanelGroup,
  { autoSaveId: "test-group", direction: "horizontal" },
  createElement(Panel, { minSizePercentage: 10, order: 1 }),
  createElement(PanelResizeHandle),
  createElement(Panel, { minSizePercentage: 10, order: 2 }),
  createElement(PanelResizeHandle),
  createElement(Panel, { minSizePercentage: 10, order: 3 })
);

const panelGroupBC = createElement(
  PanelGroup,
  { autoSaveId: "test-group", direction: "horizontal" },
  createElement(Panel, { minSizePercentage: 10, order: 2 }),
  createElement(PanelResizeHandle),
  createElement(Panel, { minSizePercentage: 10, order: 3 })
);

const panelGroupAB = createElement(
  PanelGroup,
  { autoSaveId: "test-group", direction: "horizontal" },
  createElement(Panel, { minSizePercentage: 10, order: 1 }),
  createElement(PanelResizeHandle),
  createElement(Panel, { minSizePercentage: 10, order: 2 })
);

test.describe("Storage", () => {
  test.describe("localStorage (default)", () => {
    test("should restore previous layout if autoSaveId prop has been provided", async ({
      page,
    }) => {
      await goToUrl(page, panelGroupABC);

      const resizeHandles = page.locator("[data-panel-resize-handle-id]");
      const first = resizeHandles.first();
      const last = resizeHandles.last();

      await verifyAriaValues(first, {
        min: 10,
        max: 80,
        now: 33,
      });
      await verifyAriaValues(resizeHandles.last(), {
        min: 10,
        max: 80,
        now: 33,
      });

      await first.focus();
      await page.keyboard.press("Home");
      await resizeHandles.last().focus();
      await page.keyboard.press("End");
      await page.keyboard.press("Shift+ArrowLeft");
      await verifyAriaValues(first, {
        now: 10,
      });
      await verifyAriaValues(last, {
        now: 70,
      });

      // Wait for localStorage write debounce
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Values should be remembered after a page reload
      await page.reload();
      await verifyAriaValues(first, {
        now: 10,
      });
      await verifyAriaValues(last, {
        now: 70,
      });
    });

    test("should store layouts separately per panel combination", async ({
      page,
    }) => {
      await goToUrl(page, panelGroupABC);

      const resizeHandles = page.locator("[data-panel-resize-handle-id]");
      const first = resizeHandles.first();
      const last = resizeHandles.last();

      await verifyAriaValues(first, {
        now: 33,
      });
      await verifyAriaValues(last, {
        now: 33,
      });

      // Wait for localStorage write debounce
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Hide the first panel and then resize things
      await goToUrl(page, panelGroupBC);
      await first.focus();
      await page.keyboard.press("Home");
      await verifyAriaValues(first, {
        now: 10,
      });

      // Wait for localStorage write debounce
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Hide the last panel and then resize things
      await goToUrl(page, panelGroupAB);
      await first.focus();
      await page.keyboard.press("End");
      await verifyAriaValues(first, {
        now: 90,
      });

      // Wait for localStorage write debounce
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Reload and verify all of the different layouts are remembered individually
      await goToUrl(page, panelGroupABC);
      await verifyAriaValues(first, {
        now: 33,
      });
      await verifyAriaValues(last, {
        now: 33,
      });

      await goToUrl(page, panelGroupBC);
      await verifyAriaValues(first, {
        now: 10,
      });

      await goToUrl(page, panelGroupAB);
      await verifyAriaValues(first, {
        now: 90,
      });
    });
  });
});
