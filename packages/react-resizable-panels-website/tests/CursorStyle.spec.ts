import { expect, Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getCursorStyle } from "react-resizable-panels/src/utils/cursor";
import { getBodyCursorStyle } from "./utils/cursor";
import { dragResizeTo } from "./utils/panels";

import { goToUrl } from "./utils/url";

test.describe("cursor style", () => {
  async function openPage(page: Page, direction: "horizontal" | "vertical") {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction },
        createElement(Panel, { defaultSize: 50, id: "first-panel" }),
        createElement(PanelResizeHandle),
        createElement(Panel, { defaultSize: 50, id: "last-panel" })
      )
    );
  }

  test("should not update cursor style for resizes caused by keyboard events", async ({
    page,
  }) => {
    await openPage(page, "horizontal");

    const handle = page.locator("[data-panel-resize-handle-id]");

    await expect(await getBodyCursorStyle(page)).toBe("auto");

    await handle.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(await getBodyCursorStyle(page)).toBe("auto");

    await page.keyboard.press("Shift+Tab");
    await expect(await getBodyCursorStyle(page)).toBe("auto");
  });

  test("should update cursor when dragged past the min/max size (like VS Code)", async ({
    page,
  }) => {
    await openPage(page, "horizontal");

    await dragResizeTo(
      page,
      "first-panel",
      { size: 15, expectedCursor: getCursorStyle("horizontal") },
      { size: 5, expectedCursor: getCursorStyle("horizontal-min") },
      { size: 15, expectedCursor: getCursorStyle("horizontal") },
      { size: 85, expectedCursor: getCursorStyle("horizontal") },
      { size: 95, expectedCursor: getCursorStyle("horizontal-max") },
      { size: 85, expectedCursor: getCursorStyle("horizontal") }
    );

    await openPage(page, "vertical");

    await dragResizeTo(
      page,
      "first-panel",
      { size: 15, expectedCursor: getCursorStyle("vertical") },
      { size: 5, expectedCursor: getCursorStyle("vertical-min") },
      { size: 15, expectedCursor: getCursorStyle("vertical") },
      { size: 85, expectedCursor: getCursorStyle("vertical") },
      { size: 95, expectedCursor: getCursorStyle("vertical-max") },
      { size: 85, expectedCursor: getCursorStyle("vertical") }
    );
  });
});
