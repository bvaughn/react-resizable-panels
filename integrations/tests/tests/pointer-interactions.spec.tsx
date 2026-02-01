import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Clickable } from "../src/components/Clickable";
import { Container } from "../src/components/Container";
import { IFrame } from "../src/components/IFrame";
import { assertLayoutChangeCounts } from "../src/utils/assertLayoutChangeCounts";
import { calculateHitArea } from "../src/utils/calculateHitArea";
import { getCenterCoordinates } from "../src/utils/getCenterCoordinates";
import { goToUrl } from "../src/utils/goToUrl";
import { resizeHelper } from "../src/utils/pointer-interactions/resizeHelper";

test.describe("pointer interactions", () => {
  test("drag separator to resize group", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await assertLayoutChangeCounts(mainPage, 2);
    await expect(mainPage.getByText('"left": 40')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 1000, 0);

    await assertLayoutChangeCounts(mainPage, 3);
    await expect(mainPage.getByText('"left": 95')).toBeVisible();

    await resizeHelper(page, ["left", "right"], -1000, 0);

    await assertLayoutChangeCounts(mainPage, 4);
    await expect(mainPage.getByText('"left": 5')).toBeVisible();
  });

  // See github.com/bvaughn/react-resizable-panels/issues/581
  test("should not handle or call preventDefault for right-click events", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();

    const separator = page.getByRole("separator");
    const box = (await separator.boundingBox())!;

    await page.mouse.move(box.x, box.y);
    await page.mouse.down({ button: "right" });

    // Right-click should have been registered but not handled by this library
    await expect(separator).not.toHaveAttribute("data-separator", "active");

    // Subsequent clicks should not impact the layout
    await page.mouse.move(box.x - 100, box.y);
    await page.mouse.click(0, 0);

    await new Promise((resolve) => setTimeout(resolve, 100));

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();
  });

  // See github.com/bvaughn/react-resizable-panels/issues/594
  test("should only call preventDefault for pointerup events that were handled by this library", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Container className="relative">
        <Group>
          <Panel defaultSize="30%" id="left" minSize={50} />
          <Separator />
          <Panel id="right" minSize={50} />
        </Group>
        <Clickable className="bg-red-600 absolute left-0 top-0 p-2" />
      </Container>
    );

    const clickable = page.getByText("Clickable");
    const clickableBox = (await clickable.boundingBox())!;

    // A handled "pointerdown" event should also prevent the corresponding "pointerup" event

    const separator = page.getByRole("separator");
    const separatorBox = (await separator.boundingBox())!;

    await page.mouse.move(separatorBox.x, separatorBox.y + separatorBox.height);
    await page.mouse.down();
    await page.mouse.move(clickableBox.x, clickableBox.y);
    await page.mouse.up();

    await expect(page.getByText("Clickable down:0 up:0")).toBeVisible();

    // An unhandled "pointerdown" event should not prevent the corresponding "pointerup" event

    await page.mouse.move(1000, 0);
    await page.mouse.down();
    await page.mouse.move(clickableBox.x, clickableBox.y);
    await page.mouse.up();

    await expect(page.getByText("Clickable down:0 up:1")).toBeVisible();
  });

  test("drag panel boundary to resize group", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await assertLayoutChangeCounts(mainPage, 2);
    await expect(mainPage.getByText('"left": 40')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 1000, 0);

    await assertLayoutChangeCounts(mainPage, 3);
    await expect(mainPage.getByText('"left": 95')).toBeVisible();

    await resizeHelper(page, ["left", "right"], -1000, 0);

    await assertLayoutChangeCounts(mainPage, 4);
    await expect(mainPage.getByText('"left": 5')).toBeVisible();
  });

  test("should not resize when disabled", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group disabled>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();
  });

  test("dragging a handle should resize multiple panels", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="left" minSize={50} />
        <Separator />
        <Panel id="center" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 33')).toBeVisible();
    await expect(mainPage.getByText('"center": 33')).toBeVisible();
    await expect(mainPage.getByText('"right": 33')).toBeVisible();

    await resizeHelper(page, ["left", "center"], 1000, 0);

    await assertLayoutChangeCounts(mainPage, 2);
    await expect(mainPage.getByText('"left": 89')).toBeVisible();
    await expect(mainPage.getByText('"center": 5')).toBeVisible();
    await expect(mainPage.getByText('"right": 5')).toBeVisible();

    await resizeHelper(page, ["center", "right"], -1000, 0);

    await assertLayoutChangeCounts(mainPage, 3);
    await expect(mainPage.getByText('"left": 5')).toBeVisible();
    await expect(mainPage.getByText('"center": 5')).toBeVisible();
    await expect(mainPage.getByText('"right": 89')).toBeVisible();

    await resizeHelper(page, ["center", "right"], 1000, 0);

    await assertLayoutChangeCounts(mainPage, 4);
    await expect(mainPage.getByText('"left": 5')).toBeVisible();
    await expect(mainPage.getByText('"center": 89')).toBeVisible();
    await expect(mainPage.getByText('"right": 5')).toBeVisible();
  });

  test("initial position should be the anchor while a drag is in progress", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="left" minSize={50} />
        <Separator />
        <Panel id="center" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1, 1);
    await expect(mainPage.getByText('"left": 33')).toBeVisible();
    await expect(mainPage.getByText('"center": 33')).toBeVisible();
    await expect(mainPage.getByText('"right": 33')).toBeVisible();

    const hitAreaBox = await calculateHitArea(page, ["left", "center"]);
    const { x, y } = getCenterCoordinates(hitAreaBox);

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 500, y, {
      steps: 1
    });

    await assertLayoutChangeCounts(mainPage, 2, 1);
    await expect(mainPage.getByText('"left": 86')).toBeVisible();
    await expect(mainPage.getByText('"center": 5')).toBeVisible();
    await expect(mainPage.getByText('"right": 9')).toBeVisible();

    await page.mouse.move(x - 500, y);

    await assertLayoutChangeCounts(mainPage, 3, 1);
    await expect(mainPage.getByText('"left": 5')).toBeVisible();
    await expect(mainPage.getByText('"center": 61')).toBeVisible();
    await expect(mainPage.getByText('"right": 33')).toBeVisible();

    await page.mouse.move(x, y);
    await page.mouse.up();

    // TRICKY Because the cursor ended at the exact same starting spot, no layout change was committed
    await assertLayoutChangeCounts(mainPage, 4, 1);
    await expect(mainPage.getByText('"left": 33')).toBeVisible();
    await expect(mainPage.getByText('"center": 33')).toBeVisible();
    await expect(mainPage.getByText('"right": 33')).toBeVisible();
  });

  test("drag should measure delta using the available group size (minus flex gap)", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group className="gap-20">
        <Panel defaultSize="10%" id="left" minSize="5%" />
        <Separator />
        <Panel id="right" minSize="5%" />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 10')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 800, 0);

    // The new layout would be ~91% and 9% if not for flex-gap
    await assertLayoutChangeCounts(mainPage, 2);
    await expect(mainPage.getByText('"left": 95')).toBeVisible();
  });

  test("should disable pointer-events while resize is active", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="left" />
        <Separator />
        <Panel id="right" />
      </Group>
    );

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

  test("does not notify on-changed handler until pointer resize finishes", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="left" minSize={50} />
        <Separator />
        <Panel id="center" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1, 1);
    await expect(mainPage.getByText('"left": 33')).toBeVisible();
    await expect(mainPage.getByText('"center": 33')).toBeVisible();
    await expect(mainPage.getByText('"right": 33')).toBeVisible();

    const hitAreaBox = await calculateHitArea(page, ["left", "center"]);
    const { x, y } = getCenterCoordinates(hitAreaBox);

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 500, y, {
      steps: 1
    });

    await assertLayoutChangeCounts(mainPage, 2, 1);
    await expect(mainPage.getByText('"left": 86')).toBeVisible();
    await expect(mainPage.getByText('"center": 5')).toBeVisible();
    await expect(mainPage.getByText('"right": 9')).toBeVisible();

    await page.mouse.move(x - 500, y);

    await assertLayoutChangeCounts(mainPage, 3, 1);
    await expect(mainPage.getByText('"left": 5')).toBeVisible();
    await expect(mainPage.getByText('"center": 61')).toBeVisible();
    await expect(mainPage.getByText('"right": 33')).toBeVisible();

    await page.mouse.up();

    await assertLayoutChangeCounts(mainPage, 3, 2);
    await expect(mainPage.getByText('"left": 5')).toBeVisible();
    await expect(mainPage.getByText('"center": 61')).toBeVisible();
    await expect(mainPage.getByText('"right": 33')).toBeVisible();
  });

  test("double-clicking a separator resets primary panel to default size", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator id="separator" />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await assertLayoutChangeCounts(mainPage, 2);
    await expect(mainPage.getByText('"left": 40')).toBeVisible();

    const separator = page.getByTestId("separator");
    await separator.dblclick();

    await assertLayoutChangeCounts(mainPage, 3);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();
  });

  test("double-clicking a separator resets secondary panel to default size", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="left" minSize={50} />
        <Separator id="separator" />
        <Panel defaultSize="70%" id="right" minSize={50} />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();

    await resizeHelper(page, ["left", "right"], 100, 0);

    await assertLayoutChangeCounts(mainPage, 2);
    await expect(mainPage.getByText('"left": 40')).toBeVisible();

    const separator = page.getByTestId("separator");
    await separator.dblclick();

    await assertLayoutChangeCounts(mainPage, 3);
    await expect(mainPage.getByText('"left": 30')).toBeVisible();
  });

  test.describe("focus", () => {
    test("should update focus to the nearest separator", async ({
      page: mainPage
    }) => {
      const page = await goToUrl(
        mainPage,
        <Group>
          <Panel id="left" />
          <Separator id="separator-left" />
          <Panel id="center" />
          <Separator id="separator-right" />
          <Panel id="right" />
        </Group>
      );

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
      page: mainPage
    }) => {
      const page = await goToUrl(
        mainPage,
        <Group>
          <Panel id="left" />
          <Separator id="separator-left" />
          <div>fixed size</div>
          <Separator id="separator-right" />
          <Panel id="right" />
        </Group>
      );

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

  // See github.com/bvaughn/react-resizable-panels/issues/645
  test("should update separator state when the cursor mouses over an iframe", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group className="gap-0!">
        <Panel className="p-0! *:p-0!" id="left">
          <IFrame className="w-full h-full" />
        </Panel>
        <Separator id="separator" />
        <Panel className="p-0! *:p-0!" id="right" />
      </Group>
    );

    const separator = page.getByTestId("separator");

    const { x, y } = getCenterCoordinates((await separator.boundingBox())!);

    await expect(separator).toHaveAttribute("data-separator", "inactive");

    await page.mouse.move(x, y);
    await expect(separator).toHaveAttribute("data-separator", "hover");

    await page.mouse.move(x - 25, y);
    await expect(separator).toHaveAttribute("data-separator", "inactive");
  });
});
