import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { goToUrl } from "./utils/url";

test.describe("Resize handle", () => {
  test("should set 'data-resize-handle-active' attribute when active", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, { minSizePercentage: 10 }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel, { minSizePercentage: 10 }),
        createElement(PanelResizeHandle, { style: { height: 10, width: 10 } }),
        createElement(Panel, { minSizePercentage: 10 })
      )
    );

    const resizeHandles = page.locator("[data-panel-resize-handle-id]");
    const first = resizeHandles.first();
    const last = resizeHandles.last();

    await expect(
      await first.getAttribute("data-resize-handle-active")
    ).toBeNull();
    await expect(
      await last.getAttribute("data-resize-handle-active")
    ).toBeNull();

    await first.focus();

    await expect(await first.getAttribute("data-resize-handle-active")).toBe(
      "keyboard"
    );
    await expect(
      await last.getAttribute("data-resize-handle-active")
    ).toBeNull();

    await first.blur();

    await expect(
      await first.getAttribute("data-resize-handle-active")
    ).toBeNull();
    await expect(
      await last.getAttribute("data-resize-handle-active")
    ).toBeNull();

    const bounds = (await last.boundingBox())!;
    await page.mouse.move(bounds.x, bounds.y);
    await page.mouse.down();

    await expect(
      await first.getAttribute("data-resize-handle-active")
    ).toBeNull();
    await expect(await last.getAttribute("data-resize-handle-active")).toBe(
      "pointer"
    );

    await page.mouse.up();

    await expect(
      await first.getAttribute("data-resize-handle-active")
    ).toBeNull();
    await expect(
      await last.getAttribute("data-resize-handle-active")
    ).toBeNull();
  });
});
