import { test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { expectLayout } from "./utils/expectLayout";
import { expectPanelSize } from "./utils/expectPanelSize";
import { goToUrl } from "./utils/goToUrl";

test.describe("resize events", () => {
  for (const usePopUpWindow of [true, false]) {
    test.describe(usePopUpWindow ? "in a popup" : "in the main window", () => {
      test("resizing the window should revalidate group layout constraints", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel defaultSize="30%" id="left" minSize={250} />
            <Separator />
            <Panel id="right" minSize={50} />
          </Group>,
          { usePopUpWindow }
        );

        await expectLayout({
          layout: {
            left: 30,
            right: 70
          },
          mainPage,
          onLayoutCount: 1
        });
        await expectPanelSize({
          mainPage,
          onResizeCount: 1,
          panelId: "left",
          panelSize: {
            asPercentage: 30,
            inPixels: 293
          }
        });
        await expectPanelSize({
          mainPage,
          onResizeCount: 1,
          panelId: "right",
          panelSize: {
            asPercentage: 70,
            inPixels: 683
          }
        });

        await page.setViewportSize({
          width: 500,
          height: 500
        });

        await expectLayout({
          layout: {
            left: 53,
            right: 47
          },
          mainPage,
          onLayoutCount: 2
        });
        await expectPanelSize({
          mainPage,
          onResizeCount: 3,
          panelId: "left",
          panelSize: {
            asPercentage: 53,
            inPixels: 250
          },
          prevPanelSize: {
            asPercentage: 30,
            inPixels: 143
          }
        });
        await expectPanelSize({
          mainPage,
          onResizeCount: 3,
          panelId: "right",
          panelSize: {
            asPercentage: 47,
            inPixels: 226
          },
          prevPanelSize: {
            asPercentage: 70,
            inPixels: 333
          }
        });

        await page.setViewportSize({
          width: 1000,
          height: 500
        });

        await expectLayout({
          layout: {
            left: 53,
            right: 47
          },
          mainPage,
          onLayoutCount: 2
        });
      });

      test("resizing the window should revalidate group layout constraints alt", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel id="left" minSize={50} />
            <Separator />
            <Panel id="right" minSize={50} />
          </Group>,
          { usePopUpWindow }
        );

        await expectLayout({
          layout: {
            left: 50,
            right: 50
          },
          mainPage,
          onLayoutCount: 1
        });

        await page.setViewportSize({
          width: 500,
          height: 500
        });

        await expectLayout({
          layout: {
            left: 50,
            right: 50
          },
          mainPage,
          onLayoutCount: 1
        });

        const bounds = (await page.getByRole("separator").boundingBox())!;
        await page.mouse.move(bounds.x, bounds.y);
        await page.mouse.down();
        await page.mouse.move(0, bounds.y);

        // Left would be 5% if the constraints were stale
        await expectLayout({
          layout: {
            left: 11,
            right: 89
          },
          mainPage,
          onLayoutCount: 2
        });
      });

      test("resizing the window should notify Panel resize handlers", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel defaultSize="30%" id="left" minSize={250} />
            <Separator />
            <Panel id="right" minSize={50} />
          </Group>,
          { usePopUpWindow }
        );

        await expectLayout({
          layout: {
            left: 30,
            right: 70
          },
          mainPage,
          onLayoutCount: 1
        });

        await page.setViewportSize({
          width: 500,
          height: 500
        });

        await expectLayout({
          layout: {
            left: 53,
            right: 47
          },
          mainPage,
          onLayoutCount: 2
        });

        await page.setViewportSize({
          width: 1000,
          height: 500
        });

        await expectLayout({
          layout: {
            left: 53,
            right: 47
          },
          mainPage,
          onLayoutCount: 2
        });
      });
    });
  }
});
