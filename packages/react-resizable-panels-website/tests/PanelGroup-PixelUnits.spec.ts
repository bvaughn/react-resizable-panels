import { Page, test } from "@playwright/test";
import { createElement } from "react";
import {
  Panel,
  PanelGroup,
  PanelGroupProps,
  PanelProps,
  PanelResizeHandle,
  PanelResizeHandleProps,
} from "react-resizable-panels";

import {
  dragResizeBy,
  imperativeResizePanel,
  verifyPanelSizePixels,
} from "./utils/panels";
import { goToUrl, updateUrl } from "./utils/url";
import { verifySizesPixels } from "./utils/verify";

function createElements(
  props: {
    leftPanelProps?: PanelProps;
    leftResizeHandleProps?: Partial<PanelResizeHandleProps>;
    middlePanelProps?: PanelProps;
    panelGroupProps?: Partial<PanelGroupProps>;
    rightPanelProps?: PanelProps;
    rightResizeHandleProps?: Partial<PanelResizeHandleProps>;
  } = {}
) {
  return createElement(
    PanelGroup,
    {
      direction: "horizontal",
      id: "group",
      ...props.panelGroupProps,
    },
    createElement(Panel, {
      id: "left-panel",
      minSizePixels: 10,
      ...props.leftPanelProps,
    }),
    createElement(PanelResizeHandle, {
      id: "left-resize-handle",
      ...props.leftResizeHandleProps,
    }),
    createElement(Panel, {
      id: "middle-panel",
      minSizePixels: 10,
      ...props.middlePanelProps,
    }),
    createElement(PanelResizeHandle, {
      id: "right-resize-handle",
      ...props.rightResizeHandleProps,
    }),
    createElement(Panel, {
      id: "right-panel",
      minSizePixels: 10,
      ...props.rightPanelProps,
    })
  );
}

async function goToUrlHelper(
  page: Page,
  props: {
    leftPanelProps?: PanelProps;
    leftResizeHandleProps?: Partial<PanelResizeHandleProps>;
    middlePanelProps?: PanelProps;
    panelGroupProps?: Partial<PanelGroupProps>;
    rightPanelProps?: PanelProps;
    rightResizeHandleProps?: Partial<PanelResizeHandleProps>;
  } = {}
) {
  await goToUrl(page, createElements(props));
}

test.describe("Pixel units", () => {
  test.describe("initial layout", () => {
    test("should observe max size constraint for default layout", async ({
      page,
    }) => {
      // Static left panel
      await goToUrlHelper(page, {
        leftPanelProps: { maxSizePixels: 100, minSizePixels: 50 },
      });
      const leftPanel = page.locator('[data-panel-id="left-panel"]');
      await verifyPanelSizePixels(leftPanel, 100);

      // Static middle panel
      await goToUrlHelper(page, {
        middlePanelProps: { maxSizePixels: 100, minSizePixels: 50 },
      });
      const middlePanel = page.locator('[data-panel-id="middle-panel"]');
      await verifyPanelSizePixels(middlePanel, 100);

      // Static right panel
      await goToUrlHelper(page, {
        rightPanelProps: { maxSizePixels: 100, minSizePixels: 50 },
      });
      const rightPanel = page.locator('[data-panel-id="right-panel"]');
      await verifyPanelSizePixels(rightPanel, 100);
    });

    test("should observe min size constraint for default layout", async ({
      page,
    }) => {
      await goToUrlHelper(page, {
        leftPanelProps: { maxSizePixels: 300, minSizePixels: 200 },
      });

      const leftPanel = page.locator("[data-panel]").first();
      await verifyPanelSizePixels(leftPanel, 200);
    });

    test("should honor min/max constraint when resizing via keyboard", async ({
      page,
    }) => {
      await goToUrlHelper(page, {
        leftPanelProps: { maxSizePixels: 100, minSizePixels: 50 },
      });

      const leftPanel = page.locator("[data-panel]").first();
      await verifyPanelSizePixels(leftPanel, 100);

      const resizeHandle = page
        .locator("[data-panel-resize-handle-id]")
        .first();
      await resizeHandle.focus();

      await page.keyboard.press("Home");
      await verifyPanelSizePixels(leftPanel, 50);

      await page.keyboard.press("End");
      await verifyPanelSizePixels(leftPanel, 100);
    });

    test("should honor min/max constraint when resizing via mouse", async ({
      page,
    }) => {
      await goToUrlHelper(page, {
        leftPanelProps: { maxSizePixels: 100, minSizePixels: 50 },
      });

      const leftPanel = page.locator("[data-panel]").first();

      await dragResizeBy(page, "left-resize-handle", -100);
      await verifyPanelSizePixels(leftPanel, 50);

      await dragResizeBy(page, "left-resize-handle", 200);
      await verifyPanelSizePixels(leftPanel, 100);
    });

    test("should honor min/max constraint when resizing via imperative Panel API", async ({
      page,
    }) => {
      await goToUrlHelper(page, {
        leftPanelProps: { maxSizePixels: 100, minSizePixels: 50 },
      });

      const leftPanel = page.locator("[data-panel]").first();

      await imperativeResizePanel(page, "left-panel", { sizePixels: 150 });
      await verifyPanelSizePixels(leftPanel, 100);

      await imperativeResizePanel(page, "left-panel", { sizePixels: 4 });
      await verifyPanelSizePixels(leftPanel, 50);
    });

    test("should honor min/max constraint when indirectly resizing via imperative Panel API", async ({
      page,
    }) => {
      await goToUrlHelper(page, {
        rightPanelProps: { maxSizePixels: 100, minSizePixels: 50 },
      });

      const rightPanel = page.locator("[data-panel]").last();

      await imperativeResizePanel(page, "middle-panel", { sizePixels: 1 });
      await verifyPanelSizePixels(rightPanel, 100);

      await imperativeResizePanel(page, "left-panel", { sizePixels: 350 });
      await verifyPanelSizePixels(rightPanel, 50);
    });

    test("should support collapsable panels", async ({ page }) => {
      await goToUrlHelper(page, {
        leftPanelProps: {
          collapsible: true,
          minSizePixels: 100,
          maxSizePixels: 200,
        },
      });

      const leftPanel = page.locator("[data-panel]").first();

      await imperativeResizePanel(page, "left-panel", { sizePixels: 25 });
      await verifyPanelSizePixels(leftPanel, 0);

      await imperativeResizePanel(page, "left-panel", { sizePixels: 100 });
      await verifyPanelSizePixels(leftPanel, 100);
    });
  });

  test("should observe min size pixel constraints if the overall group size shrinks", async ({
    page,
  }) => {
    await goToUrlHelper(page, {
      leftPanelProps: {
        defaultSizePixels: 50,
        maxSizePixels: 100,
        minSizePixels: 50,
      },
    });
    const leftPanel = page.locator('[data-panel-id="left-panel"]');
    await verifyPanelSizePixels(leftPanel, 50);

    await page.setViewportSize({ width: 300, height: 300 });
    await new Promise((r) => setTimeout(r, 30));
    await verifyPanelSizePixels(leftPanel, 50);

    await page.setViewportSize({ width: 400, height: 300 });
    await goToUrlHelper(page, {
      rightPanelProps: {
        defaultSizePixels: 50,
        maxSizePixels: 100,
        minSizePixels: 50,
      },
    });
    const rightPanel = page.locator('[data-panel-id="right-panel"]');
    await verifyPanelSizePixels(rightPanel, 50);

    await page.setViewportSize({ width: 300, height: 300 });
    await new Promise((resolve) => setTimeout(resolve, 250));
    await verifyPanelSizePixels(rightPanel, 50);
  });

  test("should observe max size pixel constraints if the overall group size expands", async ({
    page,
  }) => {
    await goToUrlHelper(page, {
      leftPanelProps: {
        defaultSizePixels: 100,
        maxSizePixels: 100,
        minSizePixels: 50,
      },
    });

    const leftPanel = page.locator('[data-panel-id="left-panel"]');

    await verifyPanelSizePixels(leftPanel, 100);

    await page.setViewportSize({ width: 500, height: 300 });
    await verifyPanelSizePixels(leftPanel, 100);

    await page.setViewportSize({ width: 400, height: 300 });

    await goToUrlHelper(page, {
      rightPanelProps: {
        defaultSizePixels: 100,
        maxSizePixels: 100,
        minSizePixels: 50,
      },
    });

    const rightPanel = page.locator('[data-panel-id="right-panel"]');

    await verifyPanelSizePixels(rightPanel, 100);

    await page.setViewportSize({ width: 500, height: 300 });
    await new Promise((resolve) => setTimeout(resolve, 250));
    await verifyPanelSizePixels(rightPanel, 100);
  });

  test("should observe max size constraint for multiple panels", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal", id: "group" },
        createElement(Panel, {
          id: "first-panel",
          minSizePixels: 50,
          maxSizePixels: 75,
        }),
        createElement(PanelResizeHandle, {
          id: "first-resize-handle",
        }),
        createElement(Panel, {
          id: "second-panel",
          minSizePixels: 10,
        }),
        createElement(PanelResizeHandle, {
          id: "second-resize-handle",
        }),
        createElement(Panel, {
          id: "third-panel",
          minSizePixels: 10,
        }),
        createElement(PanelResizeHandle, {
          id: "third-resize-handle",
        }),
        createElement(Panel, {
          id: "fourth-panel",
          minSizePixels: 50,
          maxSizePixels: 75,
        })
      )
    );

    const firstPanel = page.locator('[data-panel-id="first-panel"]');
    await verifyPanelSizePixels(firstPanel, 75);

    const fourthPanel = page.locator('[data-panel-id="fourth-panel"]');
    await verifyPanelSizePixels(fourthPanel, 75);

    await dragResizeBy(page, "second-resize-handle", -200);
    await verifyPanelSizePixels(firstPanel, 50);
    await verifyPanelSizePixels(fourthPanel, 75);

    await dragResizeBy(page, "second-resize-handle", 400);
    await verifyPanelSizePixels(firstPanel, 50);
    await verifyPanelSizePixels(fourthPanel, 50);
  });

  test("should validate persisted pixel layouts before re-applying", async ({
    page,
  }) => {
    let stored: { [name: string]: string } = {};
    const elements = createElements({
      panelGroupProps: {
        autoSaveId: "test-group",
        storage: {
          getItem(name: string): string | null {
            return stored[name] ?? null;
          },
          setItem(name: string, value: string): void {
            stored[name] = value;
          },
        },
      },
      leftPanelProps: {
        minSizePixels: 50,
      },
      middlePanelProps: {
        minSizePixels: 50,
      },
      rightPanelProps: {
        minSizePixels: 50,
      },
    });
    await goToUrl(page, elements as any);
    await verifySizesPixels(page, 132, 132, 132);

    await imperativeResizePanel(page, "left-panel", { sizePixels: 50 });
    await verifySizesPixels(page, 50, 214, 132);

    // Wait for localStorage write debounce
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Unload page and resize window
    await updateUrl(page, null);
    await page.setViewportSize({ width: 300, height: 300 });

    // Reload page and verify pixel validation has re-run on saved percentages
    await updateUrl(page, elements);
    await verifySizesPixels(page, 50, 147.3, 98.7);
  });
});
