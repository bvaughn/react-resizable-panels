import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { DisplayModeToggle } from "../src/components/DisplayModeToggle";
import { goToUrl } from "./utils/goToUrl";

test.describe("visibility", () => {
  test("Activity API should defer default layout calculation until visible", async ({
    page
  }) => {
    await goToUrl(
      page,
      <DisplayModeToggle mode="activity">
        <Group>
          <Panel defaultSize="25%" id="left" minSize={150} />
          <Separator />
          <Panel id="right" />
        </Group>
      </DisplayModeToggle>
    );

    await expect(page.getByText('"onLayoutCount": 0')).toBeVisible();

    await page.getByText("hidden → visible").click();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText("id: left")).toContainText("25%");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("75%");

    await page.getByText("visible → hidden").click();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();

    await page.setViewportSize({
      width: 500,
      height: 500
    });
    await page.getByText("hidden → visible").click();

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
      <DisplayModeToggle mode="css">
        <Group>
          <Panel defaultSize="25%" id="left" minSize={150} />
          <Separator />
          <Panel id="right" />
        </Group>
      </DisplayModeToggle>
    );

    await expect(page.getByText('"onLayoutCount": 0')).toBeVisible();

    await page.getByText("hidden → visible").click();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText("id: left")).toContainText("25%");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("75%");

    await page.getByText("visible → hidden").click();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    // Actual layout values are not meaningful since the Group is not visible

    await page.setViewportSize({
      width: 500,
      height: 500
    });
    await page.getByText("hidden → visible").click();

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText("id: left")).toContainText("33%");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("67%");
  });
});
