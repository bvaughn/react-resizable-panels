import { Page, expect, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PanelGroupLayoutLogEntry } from "../src/routes/examples/types";
import { getLogEntries } from "./utils/debug";

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

    const panelIdInput = page.locator("#panelIdInput");
    const resizeButton = page.locator("#resizeButton");
    const sizeInput = page.locator("#sizeInput");

    // Left panel
    await panelIdInput.focus();
    await panelIdInput.fill("left");
    await sizeInput.focus();
    await sizeInput.fill("15");
    await resizeButton.click();
    await verifySizes(page, 15, 65, 20);

    await sizeInput.focus();
    await sizeInput.fill("5");
    await resizeButton.click();
    await verifySizes(page, 10, 70, 20);

    await sizeInput.focus();
    await sizeInput.fill("55");
    await resizeButton.click();
    await verifySizes(page, 30, 50, 20);

    // Middle panel
    await panelIdInput.focus();
    await panelIdInput.fill("middle");
    await sizeInput.focus();
    await sizeInput.fill("15");
    await resizeButton.click();
    await verifySizes(page, 30, 15, 55);

    await sizeInput.focus();
    await sizeInput.fill("5");
    await resizeButton.click();
    await verifySizes(page, 30, 10, 60);

    // Right panel
    await panelIdInput.focus();
    await panelIdInput.fill("right");
    await sizeInput.focus();
    await sizeInput.fill("15");
    await resizeButton.click();
    await verifySizes(page, 30, 55, 15);

    await sizeInput.focus();
    await sizeInput.fill("5");
    await resizeButton.click();
    await verifySizes(page, 30, 60, 10);
  });

  test("should expand imperatively collapsed panels to size before collapse", async ({
    page,
  }) => {
    const collapseButton = page.locator("#collapseButton");
    const expandButton = page.locator("#expandButton");
    const panelIdInput = page.locator("#panelIdInput");
    const resizeButton = page.locator("#resizeButton");
    const sizeInput = page.locator("#sizeInput");

    await panelIdInput.focus();
    await panelIdInput.fill("left");
    await sizeInput.focus();
    await sizeInput.fill("15");
    await resizeButton.click();

    await panelIdInput.focus();
    await panelIdInput.fill("right");
    await sizeInput.focus();
    await sizeInput.fill("25");
    await resizeButton.click();

    await verifySizes(page, 15, 60, 25);

    await panelIdInput.focus();
    await panelIdInput.fill("left");
    await collapseButton.click();
    await verifySizes(page, 0, 75, 25);
    await expandButton.click();
    await verifySizes(page, 15, 60, 25);

    await panelIdInput.focus();
    await panelIdInput.fill("right");
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
    const panelIdInput = page.locator("#panelIdInput");
    const resizeButton = page.locator("#resizeButton");
    const sizeInput = page.locator("#sizeInput");

    await panelIdInput.focus();
    await panelIdInput.fill("left");

    await sizeInput.focus();
    await sizeInput.fill("15");
    await resizeButton.click();
    await verifySizes(page, 15, 65, 20);

    await sizeInput.fill("0");
    await resizeButton.click();
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
});
