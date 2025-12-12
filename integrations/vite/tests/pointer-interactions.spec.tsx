import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";
import { resizeHelper } from "./utils/resizeHelper";

test.describe("pointer interactions", () => {
  test("drag separator to resize group", async ({ page }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText('"count": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await expect(page.getByText('"count": 2')).toBeVisible();
    await expect(page.getByText('"left": 40')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 1000, 0);

    await expect(page.getByText('"count": 3')).toBeVisible();
    await expect(page.getByText('"left": 95')).toBeVisible();

    await resizeHelper(page, ["left", "right"], -1000, 0);

    await expect(page.getByText('"count": 4')).toBeVisible();
    await expect(page.getByText('"left": 5')).toBeVisible();
  });

  test("drag panel boundary to resize group", async ({ page }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText('"count": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await expect(page.getByText('"count": 2')).toBeVisible();
    await expect(page.getByText('"left": 40')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 1000, 0);

    await expect(page.getByText('"count": 3')).toBeVisible();
    await expect(page.getByText('"left": 95')).toBeVisible();

    await resizeHelper(page, ["left", "right"], -1000, 0);

    await expect(page.getByText('"count": 4')).toBeVisible();
    await expect(page.getByText('"left": 5')).toBeVisible();
  });

  test("should not resize when disabled", async ({ page }) => {
    await goToUrl(
      page,
      <Group disabled>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText('"count": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await expect(page.getByText('"count": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();
  });
});
