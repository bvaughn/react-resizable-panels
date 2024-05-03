import { test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { verifyAriaValues } from "./utils/aria";
import { imperativeCollapsePanel, imperativeExpandPanel } from "./utils/panels";
import { goToUrl } from "./utils/url";

const panelGroupABC = createElement(
  PanelGroup,
  { autoSaveId: "test-group", direction: "horizontal" },
  createElement(Panel, {
    minSize: 10,
    order: 1,
  }),
  createElement(PanelResizeHandle),
  createElement(Panel, {
    minSize: 10,
    order: 2,
  }),
  createElement(PanelResizeHandle),
  createElement(Panel, {
    minSize: 10,
    order: 3,
  })
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
      await page.keyboard.press("Shift+ArrowRight");
      await verifyAriaValues(first, {
        now: 10,
      });
      await verifyAriaValues(last, {
        now: 80,
      });

      await waitForLocalStorageWrite();

      // Values should be remembered after a page reload
      await page.reload();
      await verifyAriaValues(first, {
        now: 10,
      });
      await verifyAriaValues(last, {
        now: 80,
      });
    });

    test("should store layouts separately per panel combination", async ({
      page,
    }) => {
      const panelGroupBC = createElement(
        PanelGroup,
        { autoSaveId: "test-group", direction: "horizontal" },
        createElement(Panel, { minSize: 10, order: 2 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { minSize: 10, order: 3 })
      );

      const panelGroupAB = createElement(
        PanelGroup,
        { autoSaveId: "test-group", direction: "horizontal" },
        createElement(Panel, { minSize: 10, order: 1 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { minSize: 10, order: 2 })
      );

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

      await waitForLocalStorageWrite();

      // Hide the first panel and then resize things
      await goToUrl(page, panelGroupBC);
      await first.focus();
      await page.keyboard.press("Home");
      await verifyAriaValues(first, {
        now: 10,
      });

      await waitForLocalStorageWrite();

      // Hide the last panel and then resize things
      await goToUrl(page, panelGroupAB);
      await first.focus();
      await page.keyboard.press("End");
      await verifyAriaValues(first, {
        now: 90,
      });

      await waitForLocalStorageWrite();

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

    test("should remember the most recent expanded size for collapsed panels", async ({
      page,
    }) => {
      const panelGroup = createElement(
        PanelGroup,
        { autoSaveId: "test-group", direction: "horizontal" },
        createElement(Panel, {
          collapsible: true,
          id: "left",
          minSize: 10,
          order: 1,
        }),
        createElement(PanelResizeHandle),
        createElement(Panel, {
          collapsible: true,
          id: "middle",
          minSize: 10,
          order: 2,
        }),
        createElement(PanelResizeHandle),
        createElement(Panel, {
          collapsible: true,
          id: "right",
          minSize: 10,
          order: 3,
        })
      );

      await goToUrl(page, panelGroup);

      const resizeHandles = page.locator("[data-panel-resize-handle-id]");
      const first = resizeHandles.first();
      const last = resizeHandles.last();

      await verifyAriaValues(first, {
        now: 33,
      });
      await verifyAriaValues(last, {
        now: 33,
      });

      // Change panel sizes
      await first.focus();
      await page.keyboard.press("ArrowLeft");
      await last.focus();
      await page.keyboard.press("ArrowRight");

      // Verify sizes
      await verifyAriaValues(first, {
        now: 23,
      });
      await verifyAriaValues(last, {
        now: 53,
      });

      await waitForLocalStorageWrite();

      // Collapse panels
      await imperativeCollapsePanel(page, "left");
      await imperativeCollapsePanel(page, "right");

      // Verify sizes
      await verifyAriaValues(first, {
        now: 0,
      });
      await verifyAriaValues(last, {
        now: 100,
      });

      await waitForLocalStorageWrite();

      // Reload page
      await page.reload();

      // Verify collapsed sizes resized
      await verifyAriaValues(first, {
        now: 0,
      });
      await verifyAriaValues(last, {
        now: 100,
      });

      // Expand panels
      await imperativeExpandPanel(page, "left");
      await imperativeExpandPanel(page, "right");

      // Verify sizes
      await verifyAriaValues(first, {
        now: 23,
      });
      await verifyAriaValues(last, {
        now: 53,
      });
    });
  });
});

// Wait for localStorage write debounce
async function waitForLocalStorageWrite() {
  await new Promise((resolve) => setTimeout(resolve, 250));
}
