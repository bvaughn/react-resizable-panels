import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { calculateHitArea } from "./utils/calculateHitArea";
import { getCenterCoordinates } from "./utils/getCenterCoordinates";
import { goToUrl } from "./utils/goToUrl";
import { resizeHelper } from "./utils/pointer-interactions/resizeHelper";

test.describe("pointer interactions", () => {
  test("drag separator to resize group", async ({ page }) => {
    await goToUrl({
      element: (
        <Group>
          <Panel defaultSize="30%" id="left" minSize={50} />
          <Separator />
          <Panel id="right" minSize={50} />
        </Group>
      ),
      page
    });

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 40')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 1000, 0);

    await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
    await expect(page.getByText('"left": 95')).toBeVisible();

    await resizeHelper(page, ["left", "right"], -1000, 0);

    await expect(page.getByText('"onLayoutCount": 4')).toBeVisible();
    await expect(page.getByText('"left": 5')).toBeVisible();
  });

  test("drag panel boundary to resize group", async ({ page }) => {
    await goToUrl({
      element: (
        <Group>
          <Panel defaultSize="30%" id="left" minSize={50} />
          <Panel id="right" minSize={50} />
        </Group>
      ),
      page
    });

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 40')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 1000, 0);

    await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
    await expect(page.getByText('"left": 95')).toBeVisible();

    await resizeHelper(page, ["left", "right"], -1000, 0);

    await expect(page.getByText('"onLayoutCount": 4')).toBeVisible();
    await expect(page.getByText('"left": 5')).toBeVisible();
  });

  test("should not resize when disabled", async ({ page }) => {
    await goToUrl({
      element: (
        <Group disabled>
          <Panel defaultSize="30%" id="left" minSize={50} />
          <Separator />
          <Panel id="right" minSize={50} />
        </Group>
      ),
      page
    });

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();
  });

  test("dragging a handle should resize multiple panels", async ({ page }) => {
    await goToUrl({
      element: (
        <Group>
          <Panel id="left" minSize={50} />
          <Separator />
          <Panel id="center" minSize={50} />
          <Separator />
          <Panel id="right" minSize={50} />
        </Group>
      ),
      page
    });

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 33')).toBeVisible();
    await expect(page.getByText('"center": 33')).toBeVisible();
    await expect(page.getByText('"right": 33')).toBeVisible();

    await resizeHelper(page, ["left", "center"], 1000, 0);

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 89')).toBeVisible();
    await expect(page.getByText('"center": 5')).toBeVisible();
    await expect(page.getByText('"right": 5')).toBeVisible();

    await resizeHelper(page, ["center", "right"], -1000, 0);

    await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
    await expect(page.getByText('"left": 5')).toBeVisible();
    await expect(page.getByText('"center": 5')).toBeVisible();
    await expect(page.getByText('"right": 89')).toBeVisible();

    await resizeHelper(page, ["center", "right"], 1000, 0);

    await expect(page.getByText('"onLayoutCount": 4')).toBeVisible();
    await expect(page.getByText('"left": 5')).toBeVisible();
    await expect(page.getByText('"center": 89')).toBeVisible();
    await expect(page.getByText('"right": 5')).toBeVisible();
  });

  test("initial position should be the anchor while a drag is in progress", async ({
    page
  }) => {
    await goToUrl({
      element: (
        <Group>
          <Panel id="left" minSize={50} />
          <Separator />
          <Panel id="center" minSize={50} />
          <Separator />
          <Panel id="right" minSize={50} />
        </Group>
      ),
      page
    });

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 33')).toBeVisible();
    await expect(page.getByText('"center": 33')).toBeVisible();
    await expect(page.getByText('"right": 33')).toBeVisible();

    const hitAreaBox = await calculateHitArea(page, ["left", "center"]);
    const { x, y } = getCenterCoordinates(hitAreaBox);

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 500, y, {
      steps: 1
    });

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 87')).toBeVisible();
    await expect(page.getByText('"center": 5')).toBeVisible();
    await expect(page.getByText('"right": 8')).toBeVisible();

    await page.mouse.move(x - 500, y);

    await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
    await expect(page.getByText('"left": 5')).toBeVisible();
    await expect(page.getByText('"center": 61')).toBeVisible();
    await expect(page.getByText('"right": 33')).toBeVisible();

    await page.mouse.move(x, y);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 4')).toBeVisible();
    await expect(page.getByText('"left": 33')).toBeVisible();
    await expect(page.getByText('"center": 33')).toBeVisible();
    await expect(page.getByText('"right": 33')).toBeVisible();
  });

  test("drag should measure delta using the available group size (minus flex gap)", async ({
    page
  }) => {
    await goToUrl({
      element: (
        <Group className="gap-20">
          <Panel defaultSize="10%" id="left" minSize="5%" />
          <Separator />
          <Panel id="right" minSize="5%" />
        </Group>
      ),
      page
    });

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 10')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 800, 0);

    // The new layout would be ~91% and 9% if not for flex-gap
    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
    await expect(page.getByText('"left": 95')).toBeVisible();
  });

  test("should disable pointer-events while resize is active", async ({
    page
  }) => {
    await goToUrl({
      element: (
        <Group>
          <Panel id="left" />
          <Separator />
          <Panel id="right" />
        </Group>
      ),
      page
    });

    const hitAreaBox = await calculateHitArea(page, ["left", "right"]);
    const { x, y } = getCenterCoordinates(hitAreaBox);

    const panel = page.getByText("id: left");

    await page.mouse.move(x, y);
    await expect(panel).toHaveCSS("pointer-events", "auto");

    await page.mouse.down();
    await expect(panel).toHaveCSS("pointer-events", "none");

    await page.mouse.up();
    await expect(panel).toHaveCSS("pointer-events", "auto");
  });

  test.describe("focus", () => {
    test("should update focus to the nearest separator", async ({ page }) => {
      await goToUrl({
        element: (
          <Group>
            <Panel id="left" />
            <Separator id="separator-left" />
            <Panel id="center" />
            <Separator id="separator-right" />
            <Panel id="right" />
          </Group>
        ),
        page
      });

      const hitAreaBox = await calculateHitArea(page, ["center", "right"]);
      const { x, y } = getCenterCoordinates(hitAreaBox);

      const separator = page.getByTestId("separator-right");
      await expect(separator).not.toBeFocused();

      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.up();

      await expect(separator).toBeFocused();
    });

    test("should activate the closest separator in the event that there is two", async ({
      page
    }) => {
      await goToUrl({
        element: (
          <Group>
            <Panel id="left" />
            <Separator id="separator-left" />
            <div>fixed size</div>
            <Separator id="separator-right" />
            <Panel id="right" />
          </Group>
        ),
        page
      });

      const separatorLeft = page.getByTestId("separator-left");
      const separatorRight = page.getByTestId("separator-right");

      {
        const { x, y } = getCenterCoordinates(
          (await separatorRight.boundingBox())!
        );

        await expect(separatorRight).not.toBeFocused();

        await page.mouse.move(x, y);
        await expect(separatorLeft).not.toHaveAttribute(
          "data-separator",
          "hover"
        );
        await expect(separatorRight).toHaveAttribute("data-separator", "hover");

        await page.mouse.down();
        await expect(separatorLeft).not.toHaveAttribute(
          "data-separator",
          "active"
        );
        await expect(separatorRight).toHaveAttribute(
          "data-separator",
          "active"
        );

        await page.mouse.up();
        await expect(separatorRight).toBeFocused();
      }

      {
        const { x, y } = getCenterCoordinates(
          (await separatorLeft.boundingBox())!
        );

        await expect(separatorLeft).not.toBeFocused();

        await page.mouse.move(x, y);
        await expect(separatorLeft).toHaveAttribute("data-separator", "hover");
        await expect(separatorRight).not.toHaveAttribute(
          "data-separator",
          "hover"
        );

        await page.mouse.down();
        await expect(separatorLeft).toHaveAttribute("data-separator", "active");
        await expect(separatorRight).not.toHaveAttribute(
          "data-separator",
          "active"
        );

        await page.mouse.up();
        await expect(separatorLeft).toBeFocused();
      }
    });
  });
});
