import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { goToUrl, goToUrlWithIframe } from "./utils/url";
import assert from "assert";

test.describe("Resize handle", () => {
  test("should set 'data-resize-handle-active' attribute when active", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, { minSize: 10 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { minSize: 10 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { minSize: 10 })
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

  test("should stop dragging if the mouse is released outside of the document/owner", async ({
    page,
  }) => {
    for (let sameOrigin of [true, false]) {
      await goToUrlWithIframe(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel, { minSize: 10 }),
          createElement(PanelResizeHandle),
          createElement(Panel, { minSize: 10 })
        ),
        sameOrigin
      );

      const iframe = page.locator("iframe").first();
      const iframeBounds = await iframe.boundingBox();
      assert(iframeBounds);

      const panel = page.frameLocator("#frame").locator("[data-panel]").first();
      await expect(await panel.getAttribute("data-panel-size")).toBe("50.0");

      const handle = page
        .frameLocator("#frame")
        .locator("[data-panel-resize-handle-id]")
        .first();
      const handleBounds = await handle.boundingBox();
      assert(handleBounds);

      // Mouse down
      await page.mouse.move(handleBounds.x, handleBounds.y);
      await page.mouse.down();

      // Mouse move to iframe edge (and verify resize)
      await page.mouse.move(iframeBounds.x, iframeBounds.y);
      await expect(await panel.getAttribute("data-panel-size")).toBe("10.0");

      // Mouse move outside of iframe (and verify no resize)
      await page.mouse.move(iframeBounds.x - 10, iframeBounds.y - 10);
      await expect(await panel.getAttribute("data-panel-size")).toBe("10.0");

      // Mouse move within frame (and verify resize)
      await page.mouse.move(iframeBounds.x, iframeBounds.y);
      await page.mouse.move(handleBounds.x, handleBounds.y);
      await expect(await panel.getAttribute("data-panel-size")).toBe("50.0");

      // Mouse move to iframe edge
      await page.mouse.move(
        iframeBounds.x + iframeBounds.width,
        iframeBounds.y + iframeBounds.height
      );
      await expect(await panel.getAttribute("data-panel-size")).toBe("90.0");

      // Mouse move outside of iframe and release
      await page.mouse.move(
        iframeBounds.x + iframeBounds.width + 10,
        iframeBounds.y + iframeBounds.height + 10
      );
      await expect(await panel.getAttribute("data-panel-size")).toBe("90.0");
      await page.mouse.up();

      // Mouse move within frame (and verify no resize)
      await page.mouse.move(handleBounds.x, handleBounds.y);
      await expect(await panel.getAttribute("data-panel-size")).toBe("90.0");
      await page.mouse.move(iframeBounds.x, iframeBounds.y);
      await expect(await panel.getAttribute("data-panel-size")).toBe("90.0");
    }
  });
});
