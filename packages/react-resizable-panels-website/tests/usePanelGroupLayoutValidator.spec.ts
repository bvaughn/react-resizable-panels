import { Page, test } from "@playwright/test";
import { createElement } from "react";
import {
  Panel,
  PanelGroup,
  PanelGroupProps,
  PanelProps,
  PanelResizeHandle,
  usePanelGroupLayoutValidator,
} from "react-resizable-panels";

import {
  dragResizeTo,
  imperativeResizePanel,
  imperativeResizePanelGroup,
  verifyPanelSizePixels,
} from "./utils/panels";
import { goToUrl } from "./utils/url";

type HookConfig = Parameters<typeof usePanelGroupLayoutValidator>[0];

async function goToUrlHelper(
  page: Page,
  panelProps: {
    leftPanelProps?: PanelProps;
    middlePanelProps?: PanelProps;
    panelGroupProps?: PanelGroupProps;
    rightPanelProps?: PanelProps;
  } = {},
  hookConfig?: Partial<HookConfig>
) {
  await goToUrl(
    page,
    createElement(
      PanelGroup,
      { direction: "horizontal", id: "group", ...panelProps.panelGroupProps },
      createElement(Panel, {
        id: "left-panel",
        minSize: 5,
        ...panelProps.leftPanelProps,
      }),
      createElement(PanelResizeHandle),
      createElement(Panel, {
        id: "middle-panel",
        minSize: 5,
        ...panelProps.middlePanelProps,
      }),
      createElement(PanelResizeHandle),
      createElement(Panel, {
        id: "right-panel",
        minSize: 5,
        ...panelProps.rightPanelProps,
      })
    ),
    {
      usePanelGroupLayoutValidator: {
        minPixels: 50,
        maxPixels: 100,
        position: "left",
        ...hookConfig,
      },
    }
  );
}

test.describe("usePanelGroupLayoutValidator", () => {
  test.describe("initial layout", () => {
    test("should observe max size constraint for default layout", async ({
      page,
    }) => {
      await goToUrlHelper(page, {
        middlePanelProps: { defaultSize: 20 },
        rightPanelProps: { defaultSize: 20 },
      });

      const leftPanel = page.locator("[data-panel]").first();
      await verifyPanelSizePixels(leftPanel, 100);
    });

    test("should observe min size constraint for default layout", async ({
      page,
    }) => {
      await goToUrlHelper(page, {
        middlePanelProps: { defaultSize: 45 },
        rightPanelProps: { defaultSize: 45 },
      });

      const leftPanel = page.locator("[data-panel]").first();
      await verifyPanelSizePixels(leftPanel, 50);
    });

    test("should honor min/max constraint when resizing via keyboard", async ({
      page,
    }) => {
      await goToUrlHelper(page);

      const leftPanel = page.locator("[data-panel]").first();
      await verifyPanelSizePixels(leftPanel, 100);

      const resizeHandle = page
        .locator("[data-panel-resize-handle-id]")
        .first();
      await resizeHandle.focus();

      await page.keyboard.press("Home");
      await verifyPanelSizePixels(leftPanel, 50);

      await page.keyboard.press("End");
      await verifyPanelSizePixels(leftPanel, 100);
    });

    test("should honor min/max constraint when resizing via mouse", async ({
      page,
    }) => {
      await goToUrlHelper(page);

      const leftPanel = page.locator("[data-panel]").first();

      await dragResizeTo(page, "left-panel", { size: 50 });
      await verifyPanelSizePixels(leftPanel, 100);

      await dragResizeTo(page, "left-panel", { size: 0 });
      await verifyPanelSizePixels(leftPanel, 50);
    });

    test("should honor min/max constraint when resizing via imperative Panel API", async ({
      page,
    }) => {
      await goToUrlHelper(page);

      const leftPanel = page.locator("[data-panel]").first();

      await imperativeResizePanel(page, "left-panel", 80);
      await verifyPanelSizePixels(leftPanel, 100);

      await imperativeResizePanel(page, "left-panel", 4);
      await verifyPanelSizePixels(leftPanel, 50);
    });

    test("should honor min/max constraint when resizing via imperative PanelGroup API", async ({
      page,
    }) => {
      await goToUrlHelper(page);

      const leftPanel = page.locator("[data-panel]").first();

      await imperativeResizePanelGroup(page, "group", [80, 10, 10]);
      await verifyPanelSizePixels(leftPanel, 100);

      await imperativeResizePanelGroup(page, "group", [5, 55, 40]);
      await verifyPanelSizePixels(leftPanel, 50);
    });

    test("should support collapsable panels", async ({ page }) => {
      await goToUrlHelper(
        page,
        {},
        {
          collapseBelowPixels: 50,
          minPixels: 100,
          maxPixels: 200,
        }
      );

      const leftPanel = page.locator("[data-panel]").first();

      await imperativeResizePanel(page, "left-panel", 25);
      await verifyPanelSizePixels(leftPanel, 100);

      await imperativeResizePanel(page, "left-panel", 10);
      await verifyPanelSizePixels(leftPanel, 0);

      await imperativeResizePanel(page, "left-panel", 15);
      await verifyPanelSizePixels(leftPanel, 100);
    });
  });
});
