import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { goToUrl } from "./utils/url";

test.describe("cursor style", () => {
  function getCursorStyle(element: Element) {
    return window.getComputedStyle(element).getPropertyValue("cursor");
  }

  test("should reset cursor style on resize handle blur", async ({ page }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel),
        createElement(PanelResizeHandle),
        createElement(Panel)
      )
    );

    const body = page.locator("body");
    const handle = page.locator("[data-panel-resize-handle-id]");
    await expect(await body.evaluate(getCursorStyle)).toBe("auto");

    await handle.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(await body.evaluate(getCursorStyle)).toBe("col-resize");

    await page.keyboard.press("Shift+Tab");
    await expect(await body.evaluate(getCursorStyle)).toBe("auto");
  });
});
