import { expect, Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getBodyCursorStyle } from "./utils/cursor";
import { dragResizeTo } from "./utils/panels";

import { goToUrl } from "./utils/url";

type CursorState =
  | "horizontal"
  | "horizontal-max"
  | "horizontal-min"
  | "vertical"
  | "vertical-max"
  | "vertical-min";

function getCursorStyle(state: CursorState) {
  switch (state) {
    case "horizontal":
      return "ew-resize";
    case "horizontal-max":
      return "w-resize";
    case "horizontal-min":
      return "e-resize";
    case "vertical":
      return "ns-resize";
    case "vertical-max":
      return "n-resize";
    case "vertical-min":
      return "s-resize";
  }
}

test.describe("cursor style", () => {
  async function openPage(page: Page, direction: "horizontal" | "vertical") {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction },
        createElement(Panel, {
          defaultSizePercentage: 50,
          id: "first-panel",
          minSizePercentage: 10,
        }),
        createElement(PanelResizeHandle),
        createElement(Panel, {
          defaultSizePercentage: 50,
          id: "last-panel",
          minSizePercentage: 10,
        })
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
