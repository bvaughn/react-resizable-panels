import { Page, expect, test } from "@playwright/test";
import { createElement } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { goToUrl, updateUrl } from "./utils/url";

function createElements({
  numPanels,
  omitIdProp = false,
  omitOrderProp = false,
}: {
  numPanels: 1 | 2;
  omitIdProp?: boolean;
  omitOrderProp?: boolean;
}) {
  const panels = [
    createElement(Panel, {
      collapsible: true,
      defaultSize: numPanels === 2 ? 50 : 100,
      id: omitIdProp ? undefined : "left",
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
          createElement(Panel, { defaultSize: -1 })
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

    test("should throw if defaultSize is greater than 100 and units are relative", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel, { defaultSize: 400 })
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

    test("should not throw if defaultSize is greater than 100 and units are static", async ({
      page,
    }) => {
      await goToUrl(
        page,
        createElement(
          PanelGroup,
          { direction: "horizontal" },
          createElement(Panel, { defaultSize: 400, units: "static" })
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
          createElement(Panel)
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
          createElement(Panel, { defaultSize: 75, maxSize: 50 }),
          createElement(PanelResizeHandle),
          createElement(Panel)
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
          createElement(Panel, { defaultSize: 25 }),
          createElement(PanelResizeHandle),
          createElement(Panel, { defaultSize: 25 })
        )
      );

      await flushMessages(page);

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

  test("should warn if no minSize is provided for a panel with static units", async ({
    page,
  }) => {
    await goToUrl(
      page,
      createElement(
        PanelGroup,
        { direction: "horizontal" },
        createElement(Panel, { defaultSize: 25, units: "static" }),
        createElement(PanelResizeHandle),
        createElement(Panel)
      )
    );

    await flushMessages(page);

    expect(warnings).not.toHaveLength(0);
    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'Panels with "static" units should specify a minSize value'
        ),
      ])
    );
  });
});
