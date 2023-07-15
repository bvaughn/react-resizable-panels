import { expect, test } from "@playwright/test";
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

test.describe("Development warnings", () => {
  test.describe("conditional panels", () => {
    test("should warning about missing id props", async ({ page }) => {
      await goToUrl(
        page,
        createElements({
          omitIdProp: true,
          numPanels: 1,
        })
      );

      const warnings: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "warning") {
          warnings.push(message.text());
        }
      });

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

      const warnings: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "warning") {
          warnings.push(message.text());
        }
      });

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

      const warnings: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "warning") {
          warnings.push(message.text());
        }
      });

      await updateUrl(
        page,
        createElements({
          numPanels: 2,
        })
      );
      expect(warnings).toHaveLength(0);
    });
  });
});
