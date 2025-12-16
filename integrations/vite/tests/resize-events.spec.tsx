import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";

test.describe("resize events", () => {
  test("resizing the window should revalidate group layout constraints", async ({
    page
  }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={250} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();
    await expect(page.getByText('"right": 70')).toBeVisible();

    await page.setViewportSize({
      width: 500,
      height: 500
    });

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 54')).toBeVisible();
    await expect(page.getByText('"right": 46')).toBeVisible();

    await page.setViewportSize({
      width: 1000,
      height: 500
    });

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 54')).toBeVisible();
    await expect(page.getByText('"right": 46')).toBeVisible();
  });

  test("resizing the window should notify Panel resize handlers", async ({
    page
  }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={250} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();
    await expect(page.getByText('"right": 70')).toBeVisible();

    await page.setViewportSize({
      width: 500,
      height: 500
    });

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 54')).toBeVisible();
    await expect(page.getByText('"right": 46')).toBeVisible();

    await page.setViewportSize({
      width: 1000,
      height: 500
    });

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 54')).toBeVisible();
    await expect(page.getByText('"right": 46')).toBeVisible();
  });
});
