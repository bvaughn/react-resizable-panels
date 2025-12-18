import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";

test.describe("visibility", () => {
  test("Activity API should defer default layout calculation until visible", async ({
    page
  }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="25%" id="left" minSize={150} />
        <Separator />
        <Panel id="right" />
      </Group>,
      "/e2e/visibility/activity/hidden/"
    );

    await expect(page.getByText('"onLayoutCount": 0')).toBeVisible();

    await page.getByText("toggle activity hidden → visible").click();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText("id: left")).toContainText("25%");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("75%");

    await page.getByText("toggle activity visible → hidden").click();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();

    await page.setViewportSize({
      width: 500,
      height: 500
    });
    await page.getByText("toggle activity hidden → visible").click();

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText("id: left")).toContainText("33%");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("67%");
  });

  test("display:hidden should defer default layout calculation until visible", async ({
    page
  }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="25%" id="left" minSize={150} />
        <Separator />
        <Panel id="right" />
      </Group>,
      "/e2e/visibility/display/hidden/"
    );

    await expect(page.getByText('"onLayoutCount": 0')).toBeVisible();

    await page.getByText("toggle display hidden → visible").click();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText("id: left")).toContainText("25%");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("75%");

    await page.getByText("toggle display visible → hidden").click();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();

    await page.setViewportSize({
      width: 500,
      height: 500
    });
    await page.getByText("toggle display hidden → visible").click();

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText("id: left")).toContainText("33%");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("67%");
  });
});
