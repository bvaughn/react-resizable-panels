import { test, expect, Page } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { goToUrl } from "./utils/url";
import { verifyPanelSizePixels } from "./utils/panels";

test.describe("usePanelGroupLayoutValidator", () => {
  test.describe("initial layout", () => {
    test("should observe max size constraint for default layout", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel),
          createElement(PanelResizeHandle),
          createElement(Panel, { defaultSize: 20 }),
          createElement(PanelResizeHandle),
          createElement(Panel, { defaultSize: 20 })
        ),
        {
          usePanelGroupLayoutValidator: {
            minPixels: 50,
            maxPixels: 100,
            position: "left",
          },
        }
      );

      const leftPanel = page.locator("[data-panel]").first();
      await verifyPanelSizePixels(leftPanel, 100);
    });

    test("should observe min size constraint for default layout", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel),
          createElement(PanelResizeHandle),
          createElement(Panel, { defaultSize: 45 }),
          createElement(PanelResizeHandle),
          createElement(Panel, { defaultSize: 45 })
        ),
        {
          usePanelGroupLayoutValidator: {
            minPixels: 50,
            maxPixels: 100,
            position: "left",
          },
        }
      );

      const leftPanel = page.locator("[data-panel]").first();
      await verifyPanelSizePixels(leftPanel, 50);
    });
  });
});
