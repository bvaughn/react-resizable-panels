import { Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import {
  imperativeResizePanel,
  verifyPanelSize,
  verifyPanelSizePixels,
} from "./utils/panels";
import { goToUrl } from "./utils/url";
import { verifySizes } from "./utils/verify";

async function openPage(
  page: Page,
  options: {
    collapsedByDefault?: boolean;
  } = {}
) {
  const { collapsedByDefault = false } = options;

  const panelGroup = createElement(
    PanelGroup,
    { direction: "horizontal", id: "group" },
    createElement(Panel, {
      collapsible: true,
      defaultSize: collapsedByDefault ? 0 : 20,
      id: "left",
      maxSize: 30,
      minSize: 10,
      order: 1,
    }),
    createElement(PanelResizeHandle, { id: "left-handle" }),
    createElement(Panel, {
      collapsible: true,
      id: "middle",
      maxSize: 100,
      minSize: 10,
      order: 2,
    }),
    createElement(PanelResizeHandle, { id: "right-handle" }),
    createElement(Panel, {
      collapsible: true,
      defaultSize: collapsedByDefault ? 0 : 20,
      id: "right",
      maxSize: 100,
      minSize: 10,
      order: 3,
    })
  );

  await goToUrl(page, panelGroup);
}

test.describe("Imperative Panel API", () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page);
  });

  test("should resize panels within min/max boundaries", async ({ page }) => {
    await verifySizes(page, 20, 60, 20);

    await imperativeResizePanel(page, "left", 15);
    await verifySizes(page, 15, 65, 20);
    await imperativeResizePanel(page, "left", 5);
    await verifySizes(page, 10, 70, 20);
    await imperativeResizePanel(page, "left", 55);
    await verifySizes(page, 30, 50, 20);

    await imperativeResizePanel(page, "middle", 15);
    await verifySizes(page, 30, 15, 55);
    await imperativeResizePanel(page, "middle", 5);
    await verifySizes(page, 30, 10, 60);

    await imperativeResizePanel(page, "right", 15);
    await verifySizes(page, 30, 55, 15);
    await imperativeResizePanel(page, "right", 5);
    await verifySizes(page, 30, 60, 10);
  });

  test("should expand imperatively collapsed panels to size before collapse", async ({
    page,
  }) => {
    const collapseButton = page.locator("#collapseButton");
    const expandButton = page.locator("#expandButton");
    const panelIdSelect = page.locator("#panelIdSelect");

    await imperativeResizePanel(page, "left", 15);
    await imperativeResizePanel(page, "right", 25);
    await verifySizes(page, 15, 60, 25);

    await panelIdSelect.selectOption("left");
    await collapseButton.click();
    await verifySizes(page, 0, 75, 25);
    await expandButton.click();
    await verifySizes(page, 15, 60, 25);

    await panelIdSelect.selectOption("right");
    await collapseButton.click();
    await verifySizes(page, 15, 85, 0);
    await expandButton.click();
    await verifySizes(page, 15, 60, 25);
  });

  test("should expand drag collapsed panels to their most recent size", async ({
    page,
  }) => {
    await verifySizes(page, 20, 60, 20);

    const expandButton = page.locator("#expandButton");

    await imperativeResizePanel(page, "left", 15);
    await verifySizes(page, 15, 65, 20);

    await imperativeResizePanel(page, "left", 0);
    await verifySizes(page, 0, 80, 20);

    await expandButton.click();
    await verifySizes(page, 15, 65, 20);
  });

  test("should expand to the panel's minSize if collapsed by default", async ({
    page,
  }) => {
    await openPage(page, { collapsedByDefault: true });

    const leftHandle = page.locator(
      '[data-panel-resize-handle-id="left-handle"]'
    );
    const rightHandle = page.locator(
      '[data-panel-resize-handle-id="right-handle"]'
    );

    await leftHandle.focus();
    await page.keyboard.press("ArrowRight");

    await rightHandle.focus();
    await page.keyboard.press("Shift+ArrowLeft");

    await verifySizes(page, 10, 80, 10);
  });

  test("should allow default group units of percentages to be overridden with pixels", async ({
    page,
  }) => {
    await verifySizes(page, 20, 60, 20);

    const leftPanel = page.locator('[data-panel-id="left"]');

    await imperativeResizePanel(page, "left", 15);
    await verifySizes(page, 15, 65, 20);

    await imperativeResizePanel(page, "left", 50, "pixels");
    await verifyPanelSizePixels(leftPanel, 50);
  });

  test("should allow default group units of pixels to be overridden with percentages", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal", units: "pixels" },
        createElement(Panel, {
          defaultSize: 200,
          id: "left",
          maxSize: 300,
          minSize: 100,
        }),
        createElement(PanelResizeHandle),
        createElement(Panel, {
          id: "right",
          maxSize: 300,
          minSize: 100,
        })
      )
    );

    const leftPanel = page.locator('[data-panel-id="left"]');
    await verifyPanelSizePixels(leftPanel, 200);

    await imperativeResizePanel(page, "left", 150);
    await verifyPanelSizePixels(leftPanel, 150);

    await imperativeResizePanel(page, "left", 40, "percentages");
    await verifyPanelSize(leftPanel, 40);
  });
});
