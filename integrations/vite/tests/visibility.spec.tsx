import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { DisplayModeToggle } from "../src/components/DisplayModeToggle";
import { goToUrl } from "./utils/goToUrl";

test.describe("visibility", () => {
  for (const usePopUpWindow of [true, false]) {
    test.describe(usePopUpWindow ? "in a popup" : "in the main window", () => {
      test("Activity API should defer default layout calculation until visible", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <DisplayModeToggle mode="activity">
            <Group>
              <Panel defaultSize="25%" id="left" minSize={150} />
              <Separator />
              <Panel id="right" />
            </Group>
          </DisplayModeToggle>,
          { usePopUpWindow }
        );

        await expect(mainPage.getByText('"onLayoutCount": 0')).toBeVisible();

        await page.getByText("hidden → visible").click();

        await expect(mainPage.getByText('"onLayoutCount": 1')).toBeVisible();
        await expect(page.getByText("id: left")).toContainText("25%");
        await expect(page.getByRole("separator")).toBeVisible();
        await expect(page.getByText("id: right")).toContainText("75%");

        await page.getByText("visible → hidden").click();

        await expect(mainPage.getByText('"onLayoutCount": 1')).toBeVisible();

        await page.setViewportSize({
          width: 500,
          height: 500
        });
        await page.getByText("hidden → visible").click();

        await expect(mainPage.getByText('"onLayoutCount": 2')).toBeVisible();
        await expect(page.getByText("id: left")).toContainText("32%");
        await expect(page.getByRole("separator")).toBeVisible();
        await expect(page.getByText("id: right")).toContainText("68%");
      });

      test("display:hidden should defer default layout calculation until visible", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <DisplayModeToggle mode="css">
            <Group>
              <Panel defaultSize="25%" id="left" minSize={150} />
              <Separator />
              <Panel id="right" />
            </Group>
          </DisplayModeToggle>,
          { usePopUpWindow }
        );

        await expect(mainPage.getByText('"onLayoutCount": 0')).toBeVisible();

        await page.getByText("hidden → visible").click();

        await expect(mainPage.getByText('"onLayoutCount": 1')).toBeVisible();
        await expect(page.getByText("id: left")).toContainText("25%");
        await expect(page.getByRole("separator")).toBeVisible();
        await expect(page.getByText("id: right")).toContainText("75%");

        await page.getByText("visible → hidden").click();

        await expect(mainPage.getByText('"onLayoutCount": 1')).toBeVisible();
        // Actual layout values are not meaningful since the Group is not visible

        await page.setViewportSize({
          width: 500,
          height: 500
        });
        await page.getByText("hidden → visible").click();

        await expect(mainPage.getByText('"onLayoutCount": 2')).toBeVisible();
        await expect(page.getByText("id: left")).toContainText("32%");
        await expect(page.getByRole("separator")).toBeVisible();
        await expect(page.getByText("id: right")).toContainText("68%");
      });
    });
  }
});
