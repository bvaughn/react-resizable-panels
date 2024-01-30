import { expect, Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getBodyCursorStyle } from "./utils/cursor";
import { dragResizeIntersecting, dragResizeTo } from "./utils/panels";

import { goToUrl } from "./utils/url";
import { getCursorStyle } from "../../react-resizable-panels/src/utils/cursor";
import {
  EXCEEDED_HORIZONTAL_MAX,
  EXCEEDED_HORIZONTAL_MIN,
  EXCEEDED_VERTICAL_MAX,
  EXCEEDED_VERTICAL_MIN,
} from "../../react-resizable-panels/src/PanelResizeHandleRegistry";

test.describe("cursor style", () => {
  async function openPage(page: Page, direction: "horizontal" | "vertical") {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction },
        createElement(Panel, {
          defaultSize: 50,
          id: "first-panel",
          minSize: 10,
        }),
        createElement(PanelResizeHandle),
        createElement(Panel, {
          defaultSize: 50,
          id: "last-panel",
          minSize: 10,
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
      { size: 15, expectedCursor: getCursorStyle("horizontal", 0) },
      {
        size: 5,
        expectedCursor: getCursorStyle("horizontal", EXCEEDED_HORIZONTAL_MIN),
      },
      { size: 15, expectedCursor: getCursorStyle("horizontal", 0) },
      { size: 85, expectedCursor: getCursorStyle("horizontal", 0) },
      {
        size: 95,
        expectedCursor: getCursorStyle("horizontal", EXCEEDED_HORIZONTAL_MAX),
      },
      { size: 85, expectedCursor: getCursorStyle("horizontal", 0) }
    );

    await openPage(page, "vertical");

    await dragResizeTo(
      page,
      "first-panel",
      { size: 15, expectedCursor: getCursorStyle("vertical", 0) },
      {
        size: 5,
        expectedCursor: getCursorStyle("vertical", EXCEEDED_VERTICAL_MIN),
      },
      { size: 15, expectedCursor: getCursorStyle("vertical", 0) },
      { size: 85, expectedCursor: getCursorStyle("vertical", 0) },
      {
        size: 95,
        expectedCursor: getCursorStyle("vertical", EXCEEDED_VERTICAL_MAX),
      },
      { size: 85, expectedCursor: getCursorStyle("vertical", 0) }
    );
  });

  test("should update cursor when dragging intersecting panels (like tmux)", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal", id: "outer-group" },
        createElement(Panel, {
          defaultSize: 50,
          minSize: 25,
          maxSize: 75,
        }),
        createElement(PanelResizeHandle, {
          id: "horizontal-handle",
        }),
        createElement(
          Panel,
          {
            defaultSize: 50,
            minSize: 25,
            maxSize: 75,
          },
          createElement(
            PanelGroup,
            { direction: "vertical" },
            createElement(Panel, {
              defaultSize: 50,
              minSize: 25,
              maxSize: 75,
            }),
            createElement(PanelResizeHandle, {
              id: "vertical-handle",
            }),
            createElement(Panel, {
              defaultSize: 50,
              minSize: 25,
              maxSize: 75,
            })
          )
        )
      )
    );

    await dragResizeIntersecting(
      page,
      "outer-group",
      ["horizontal-handle", "vertical-handle"],
      {
        expectedCursor: getCursorStyle("intersection", 0),
        sizeX: 0.4,
        sizeY: 0.4,
      },
      {
        expectedCursor: getCursorStyle("intersection", 0),
        sizeX: 0.6,
        sizeY: 0.6,
      },
      {
        expectedCursor: getCursorStyle("intersection", EXCEEDED_HORIZONTAL_MIN),
        sizeX: 0.1,
      },
      {
        expectedCursor: getCursorStyle("intersection", EXCEEDED_HORIZONTAL_MAX),
        sizeX: 0.9,
      },
      {
        expectedCursor: getCursorStyle("intersection", EXCEEDED_VERTICAL_MIN),
        sizeY: 0.1,
      },
      {
        expectedCursor: getCursorStyle("intersection", EXCEEDED_VERTICAL_MAX),
        sizeY: 0.9,
      },
      {
        expectedCursor: getCursorStyle(
          "intersection",
          EXCEEDED_HORIZONTAL_MIN | EXCEEDED_VERTICAL_MIN
        ),
        sizeX: 0.1,
        sizeY: 0.1,
      },
      {
        expectedCursor: getCursorStyle(
          "intersection",
          EXCEEDED_HORIZONTAL_MIN | EXCEEDED_VERTICAL_MAX
        ),
        sizeX: 0.1,
        sizeY: 0.9,
      },
      {
        expectedCursor: getCursorStyle(
          "intersection",
          EXCEEDED_HORIZONTAL_MAX | EXCEEDED_VERTICAL_MIN
        ),
        sizeX: 0.9,
        sizeY: 0.1,
      },
      {
        expectedCursor: getCursorStyle(
          "intersection",
          EXCEEDED_HORIZONTAL_MAX | EXCEEDED_VERTICAL_MAX
        ),
        sizeX: 0.9,
        sizeY: 0.9,
      }
    );
  });
});
