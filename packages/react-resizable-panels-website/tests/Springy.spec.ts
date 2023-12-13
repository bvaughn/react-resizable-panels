import { Page, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { dragResizeTo } from "./utils/panels";
import { goToUrl } from "./utils/url";
import { verifySizes } from "./utils/verify";

async function openPage(page: Page) {
  const panelGroup = createElement(
    PanelGroup,
    { direction: "horizontal", id: "group" },
    createElement(Panel, {
      defaultSize: 25,
      id: "left-panel",
      minSize: 10,
      order: 1,
    }),
    createElement(PanelResizeHandle, { id: "left-handle" }),
    createElement(Panel, {
      id: "middle-panel",
      minSize: 10,
      order: 2,
    }),
    createElement(PanelResizeHandle, { id: "right-handle" }),
    createElement(Panel, {
      collapsible: true,
      defaultSize: 25,
      id: "right-panel",
      minSize: 10,
      order: 4,
    })
  );

  await goToUrl(page, panelGroup);
}

test.describe("springy panels", () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page);
  });

  test("later panels should be springy when expanding then collapsing the first panel", async ({
    page,
  }) => {
    await verifySizes(page, 25, 50, 25);

    // Test expanding the first panel
    await dragResizeTo(
      page,
      "left-panel",
      { size: 80, expectedSizes: [80, 10, 10] },
      // Items should re-expand to their initial sizes
      { size: 25, expectedSizes: [25, 50, 25] },
      // But they should not expand past those sizes
      { size: 10, expectedSizes: [10, 65, 25] }
    );
  });

  test("earlier panels should be springy when expanding then collapsing the last panel", async ({
    page,
  }) => {
    await verifySizes(page, 25, 50, 25);

    // Test expanding the last panel
    await dragResizeTo(
      page,
      "right-panel",
      { size: 80, expectedSizes: [10, 10, 80] },
      // Items should re-expand to their initial sizes
      { size: 25, expectedSizes: [25, 50, 25] },
      // But they should not expand past those sizes
      { size: 10, expectedSizes: [25, 65, 10] }
    );
  });

  test("panels should remember a max spring point per drag", async ({
    page,
  }) => {
    await verifySizes(page, 25, 50, 25);

    await dragResizeTo(page, "left-panel", {
      size: 70,
      expectedSizes: [70, 10, 20],
    });

    await dragResizeTo(
      page,
      "left-panel",
      { size: 80, expectedSizes: [80, 10, 10] },
      { size: 70, expectedSizes: [70, 10, 20] },
      { size: 10, expectedSizes: [10, 70, 20] }
    );
  });
});
