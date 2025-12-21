import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
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

        await expect(mainPage.getByText('"onLayoutCount": 1')).toBeVisible();
        await expect(mainPage.getByText('"left": 30')).toBeVisible();
        await expect(mainPage.getByText('"right": 70')).toBeVisible();

        await page.setViewportSize({
          width: 500,
          height: 500
        });

        await expect(mainPage.getByText('"onLayoutCount": 2')).toBeVisible();
        await expect(mainPage.getByText('"left": 53')).toBeVisible();
        await expect(mainPage.getByText('"right": 47')).toBeVisible();

        await page.setViewportSize({
          width: 1000,
          height: 500
        });

        await expect(mainPage.getByText('"onLayoutCount": 2')).toBeVisible();
        await expect(mainPage.getByText('"left": 53')).toBeVisible();
        await expect(mainPage.getByText('"right": 47')).toBeVisible();
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

        await expect(mainPage.getByText('"onLayoutCount": 1')).toBeVisible();
        await expect(mainPage.getByText('"left": 50')).toBeVisible();
        await expect(mainPage.getByText('"right": 50')).toBeVisible();

        await page.setViewportSize({
          width: 500,
          height: 500
        });

        await expect(mainPage.getByText('"onLayoutCount": 1')).toBeVisible();
        await expect(mainPage.getByText('"left": 50')).toBeVisible();
        await expect(mainPage.getByText('"right": 50')).toBeVisible();

        const bounds = (await page.getByRole("separator").boundingBox())!;
        await page.mouse.move(bounds.x, bounds.y);
        await page.mouse.down();
        await page.mouse.move(0, bounds.y);

        // Left would be 5% if the constraints were stale
        await expect(mainPage.getByText('"onLayoutCount": 2')).toBeVisible();
        await expect(mainPage.getByText('"left": 11')).toBeVisible();
        await expect(mainPage.getByText('"right": 89')).toBeVisible();
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

        await expect(mainPage.getByText('"onLayoutCount": 1')).toBeVisible();
        await expect(mainPage.getByText('"left": 30')).toBeVisible();
        await expect(mainPage.getByText('"right": 70')).toBeVisible();

        await page.setViewportSize({
          width: 500,
          height: 500
        });

        await expect(mainPage.getByText('"onLayoutCount": 2')).toBeVisible();
        await expect(mainPage.getByText('"left": 53')).toBeVisible();
        await expect(mainPage.getByText('"right": 47')).toBeVisible();

        await page.setViewportSize({
          width: 1000,
          height: 500
        });

        await expect(mainPage.getByText('"onLayoutCount": 2')).toBeVisible();
        await expect(mainPage.getByText('"left": 53')).toBeVisible();
        await expect(mainPage.getByText('"right": 47')).toBeVisible();
      });
    });
  }
});
