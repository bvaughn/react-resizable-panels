import { Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { imperativeResizePanelGroup } from "./utils/panels";
import { goToUrl } from "./utils/url";
import { verifySizes, verifySizesPixels } from "./utils/verify";

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

test.describe("Imperative PanelGroup API", () => {
  test("should resize all panels", async ({ page }) => {
    await openPage(page);
    await verifySizes(page, 20, 60, 20);

    await imperativeResizePanelGroup(page, "group", [10, 20, 70]);
    await verifySizes(page, 10, 20, 70);

    await imperativeResizePanelGroup(page, "group", [90, 6, 4]);
    await verifySizes(page, 90, 6, 4);
  });

  test("should allow default group units of percentages to be overridden with pixels", async ({
    page,
  }) => {
    await openPage(page);
    await verifySizes(page, 20, 60, 20);

    await imperativeResizePanelGroup(page, "group", [10, 20, 70]);
    await verifySizes(page, 10, 20, 70);

    await imperativeResizePanelGroup(page, "group", [60, 100, 236], "pixels");
    await verifySizesPixels(page, 60, 100, 236);
  });

  test("should allow default group units of pixels to be overridden with percentages", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal", id: "group", units: "pixels" },
        createElement(Panel, {
          defaultSize: 60,
          maxSize: 350,
          minSize: 10,
        }),
        createElement(PanelResizeHandle, { id: "left-handle" }),
        createElement(Panel, {
          defaultSize: 100,
          maxSize: 350,
          minSize: 10,
        }),
        createElement(PanelResizeHandle, { id: "right-handle" }),
        createElement(Panel, {
          defaultSize: 236,
          maxSize: 350,
          minSize: 10,
        })
      )
    );

    await verifySizesPixels(page, 60, 100, 236);

    await imperativeResizePanelGroup(page, "group", [70, 90, 236]);
    await verifySizesPixels(page, 70, 90, 236);

    await imperativeResizePanelGroup(
      page,
      "group",
      [10, 20, 70],
      "percentages"
    );
    await verifySizes(page, 10, 20, 70);
  });
});
