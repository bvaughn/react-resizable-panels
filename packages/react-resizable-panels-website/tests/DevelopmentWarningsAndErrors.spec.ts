import { Page, expect, test } from "@playwright/test";
import { ReactNode, createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { goToUrl, updateUrl } from "./utils/url";
import {
  imperativeResizePanel,
  imperativeResizePanelGroup,
} from "./utils/panels";
import { verifySizes } from "./utils/verify";

function createElements({
  numPanels,
  omitIdProp = false,
  omitOrderProp = false,
}: {
  numPanels: 1 | 2;
  omitIdProp?: boolean;
  omitOrderProp?: boolean;
}) {
  const panels: ReactNode[] = [
    createElement(Panel, {
      collapsible: true,
      defaultSize: numPanels === 2 ? 50 : 100,
      id: omitIdProp ? undefined : "left",
      minSize: 10,
      order: omitOrderProp ? undefined : 1,
    }),
  ];

  if (numPanels === 2) {
    panels.push(
      createElement(PanelResizeHandle, { id: "right-handle" }),
      createElement(Panel, {
        collapsible: true,
        defaultSize: 50,
        id: omitIdProp ? undefined : "right",
        minSize: 10,
        order: omitOrderProp ? undefined : 2,
      })
    );
  }

  return createElement(
    PanelGroup,
    { direction: "horizontal", id: "group" },
    ...panels
  );
}

async function flushMessages(page: Page) {
  await goToUrl(page, createElement(PanelGroup));
}

test.describe("Development warnings and errors", () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  test.beforeEach(({ page }) => {
    errors.splice(0);
    warnings.splice(0);

    page.on("console", (message) => {
      switch (message.type()) {
        case "error":
          errors.push(message.text());
          break;
        case "warning":
          warnings.push(message.text());
          break;
      }
    });
  });

  test.describe("conditional panels", () => {
    test("should warning about missing id props", async ({ page }) => {
      await goToUrl(
        page,
        createElements({
          omitIdProp: true,
          numPanels: 1,
        })
      );

      await updateUrl(
        page,
        createElements({
          omitIdProp: true,
          numPanels: 2,
        })
      );
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("id and order props recommended");

      await updateUrl(
        page,
        createElements({
          omitIdProp: true,
          numPanels: 1,
        })
      );
      expect(warnings).toHaveLength(1);
    });

    test("should warning about missing order props", async ({ page }) => {
      await goToUrl(
        page,
        createElements({
          omitOrderProp: true,
          numPanels: 1,
        })
      );

      await updateUrl(
        page,
        createElements({
          omitOrderProp: true,
          numPanels: 2,
        })
      );
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("id and order props recommended");

      await updateUrl(
        page,
        createElements({
          omitOrderProp: true,
          numPanels: 1,
        })
      );
      expect(warnings).toHaveLength(1);
    });

    test("should not warn if id an order props are specified", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElements({
          numPanels: 1,
        })
      );

      await updateUrl(
        page,
        createElements({
          numPanels: 2,
        })
      );
      expect(warnings).toHaveLength(0);
    });

    test("should throw if defaultSize is less than 0", async ({ page }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel, { defaultSize: -1, minSize: 10 })
        )
      );

      await flushMessages(page);

      expect(errors).not.toHaveLength(0);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Invalid Panel defaultSize provided, -1"),
        ])
      );
    });

    test("should throw if defaultSize is greater than 100 and units are percentages", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel, { defaultSize: 400, minSize: 10 })
        )
      );

      await flushMessages(page);

      expect(errors).not.toHaveLength(0);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Invalid Panel defaultSize provided, 400"),
        ])
      );
    });

    test("should not throw if defaultSize is greater than 100 and units are pixels", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal", units: "pixels" },
          createElement(Panel, { defaultSize: 400, minSize: 10 })
        )
      );

      await flushMessages(page);

      expect(errors).toHaveLength(0);
    });

    test("should warn if defaultSize is less than minSize", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel, { defaultSize: 25, minSize: 50 }),
          createElement(PanelResizeHandle),
          createElement(Panel, { minSize: 10 })
        )
      );

      await flushMessages(page);

      expect(errors).not.toHaveLength(0);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            "Panel minSize (50) cannot be greater than defaultSize (25)"
          ),
        ])
      );
    });

    test("should warn if defaultSize is greater than maxSize", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel, { defaultSize: 75, maxSize: 50, minSize: 10 }),
          createElement(PanelResizeHandle),
          createElement(Panel, { minSize: 10 })
        )
      );

      await flushMessages(page);

      expect(errors).not.toHaveLength(0);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            "Panel maxSize (50) cannot be less than defaultSize (75)"
          ),
        ])
      );
    });

    test("should warn if total defaultSizes do not add up to 100", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel, { defaultSize: 25, maxSize: 25, minSize: 10 }),
          createElement(PanelResizeHandle),
          createElement(Panel, { defaultSize: 25, maxSize: 25, minSize: 10 })
        )
      );

      await verifySizes(page, 25, 25);

      expect(errors).not.toHaveLength(0);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            "Invalid panel group configuration; default panel sizes should total 100% but was 50.0%"
          ),
        ])
      );
    });
  });

  test("should warn if invalid layout constraints are provided", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, { minSize: 75 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { minSize: 75 })
      )
    );

    await flushMessages(page);

    expect(errors).not.toHaveLength(0);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Invalid panel group configuration; default panel sizes should total 100% but was 150.0%."
        ),
      ])
    );

    errors.splice(0);

    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, { maxSize: 25, minSize: 10 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { maxSize: 25, minSize: 10 })
      )
    );

    await flushMessages(page);

    expect(errors).not.toHaveLength(0);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Invalid panel group configuration; default panel sizes should total 100% but was 50.0%."
        ),
      ])
    );
  });

  test("should warn about invalid sizes set via imperative Panel API", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, { id: "left-panel", minSize: 25 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { id: "middle-panel", minSize: 25 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { id: "right-panel", maxSize: 25, minSize: 10 })
      )
    );

    await imperativeResizePanel(page, "left-panel", 20);

    expect(errors).not.toHaveLength(0);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'Invalid size (20) specified for Panel "left-panel"'
        ),
      ])
    );

    errors.splice(0);

    await imperativeResizePanel(page, "right-panel", 50);

    expect(errors).not.toHaveLength(0);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'Invalid size (50) specified for Panel "right-panel"'
        ),
      ])
    );
  });

  test("should warn about invalid layouts set via imperative PanelGroup API", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal", id: "group" },
        createElement(Panel, { id: "left-panel", minSize: 25 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { id: "middle-panel", minSize: 25 }),
        createElement(PanelResizeHandle),
        createElement(Panel, { id: "right-panel", maxSize: 25, minSize: 10 })
      )
    );

    await imperativeResizePanelGroup(page, "group", [20, 60, 20]);

    expect(errors).not.toHaveLength(0);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'Invalid size (20) specified for Panel "left-panel"'
        ),
      ])
    );

    errors.splice(0);

    await imperativeResizePanelGroup(page, "group", [25, 25, 50]);

    expect(errors).not.toHaveLength(0);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'Invalid size (50) specified for Panel "right-panel"'
        ),
      ])
    );
  });
});
