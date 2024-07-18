import { Page, expect, test } from "@playwright/test";
import { createElement } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  assert,
} from "react-resizable-panels";

import { goToUrl } from "./utils/url";
import { getBodyCursorStyle } from "./utils/cursor";

test.describe("stacking order", () => {
  async function openPage(page: Page) {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, {
          defaultSize: 50,
          id: "left-panel",
          minSize: 10,
        }),
        createElement(PanelResizeHandle),
        createElement(Panel, {
          defaultSize: 50,
          id: "right-panel",
          minSize: 10,
        })
      )
    );
  }

  test("should not update cursor or start dragging if a resize handle is underneath another element", async ({
    page,
  }) => {
    await openPage(page);

    const toggleButton = page.locator("#toggleModalButton");
    const modal = page.locator('[data-test-id="ModalBox"]');

    // Show modal overlay
    await toggleButton.click();
    await expect(await modal.isHidden()).toBe(false);

    const dragHandleRect = await modal.boundingBox();
    assert(dragHandleRect, "No bounding box found for modal");

    const pageX = dragHandleRect.x + dragHandleRect.width / 2;
    const pageY = dragHandleRect.y + dragHandleRect.height / 2;

    page.mouse.down();

    {
      page.mouse.move(pageX, pageY);

      const actualCursor = await getBodyCursorStyle(page);
      await expect(actualCursor).toBe("auto");
    }

    // Hide modal overlay
    await toggleButton.click();
    await expect(await modal.isHidden()).toBe(true);

    page.mouse.move(0, 0);

    {
      page.mouse.move(pageX, pageY);

      const actualCursor = await getBodyCursorStyle(page);
      await expect(actualCursor).toBe("ew-resize");
    }
  });
});
