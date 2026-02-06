import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { calculateHitArea } from "../src/utils/calculateHitArea";
import { getCenterCoordinates } from "../src/utils/getCenterCoordinates";
import { goToUrl } from "../src/utils/goToUrl";

// The cursor boundary check logic relies on the layout not changing between two movements in order to detect "you've moved too far, there's no more resizing that can be done"
// This type of test isn't totally realistic; only one mouse-move between big pixel gaps is unlikely in all but the most extreme perf bottlenecks.
// To mimic something closer to a real world scenario, we need to split move events into multiple pointer move events.
const moveConfig = { steps: 10 };

test.describe("cursor", () => {
  test("horizontal", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group orientation="horizontal">
        <Panel id="left" minSize="25%" />
        <Separator />
        <Panel id="right" minSize="25%" />
      </Group>
    );

    const hitAreaBox = await calculateHitArea(page, ["left", "right"]);
    const { x, y } = getCenterCoordinates(hitAreaBox);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");

    await page.mouse.move(x, y, moveConfig);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("ew-resize");

    await page.mouse.down();
    await page.mouse.move(25, y, moveConfig);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("e-resize");

    await page.mouse.move(975, y, moveConfig);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("w-resize");
  });

  test("vertical", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group orientation="vertical">
        <Panel id="top" minSize="25%" />
        <Separator />
        <Panel id="bottom" minSize="25%" />
      </Group>
    );

    const hitAreaBox = await calculateHitArea(page, ["top", "bottom"]);
    const { x, y } = getCenterCoordinates(hitAreaBox);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");

    await page.mouse.move(x, y, moveConfig);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("ns-resize");

    await page.mouse.down();
    await page.mouse.move(x, 0, moveConfig);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("s-resize");

    await page.mouse.move(x, 600, moveConfig);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("n-resize");
  });

  test("intersecting", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group className="h-[250px]!" orientation="vertical">
        <Panel id="top" minSize="25%" />
        <Separator id="vertical-separator" />
        <Panel id="bottom" minSize="25%">
          <Group orientation="horizontal">
            <Panel id="left" minSize="25%" />
            <Separator />
            <Panel id="right" minSize="25%" />
          </Group>
        </Panel>
      </Group>
    );

    const separator = page.getByTestId("vertical-separator");
    const boundingBox = (await separator.boundingBox())!;
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y;

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");

    // Centered
    await page.mouse.move(x, y, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("move");

    // Top left
    await page.mouse.down();
    await page.mouse.move(1, 1, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("se-resize");

    // Top
    await page.mouse.move(x, 0, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("s-resize");

    // Top right
    await page.mouse.move(1000, 1, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("sw-resize");

    // Right
    await page.mouse.move(975, y, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("w-resize");

    // Bottom right
    await page.mouse.move(1000, 600, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("nw-resize");

    // Bottom
    await page.mouse.move(x, 600, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("n-resize");

    // Bottom left
    await page.mouse.move(1, 600, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("ne-resize");

    // Left
    await page.mouse.move(25, y, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("e-resize");

    // Centered
    await page.mouse.move(x, y, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("move");
  });

  test("edge case", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group className="h-[250px]!" orientation="vertical">
        <Panel id="top" minSize="25%" />
        <Separator id="vertical-separator" />
        <Panel id="bottom" minSize="25%">
          <Group orientation="horizontal">
            <Panel id="left" minSize="25%" />
            <Separator />
            <Panel id="right" minSize="25%" />
          </Group>
        </Panel>
      </Group>
    );

    const separator = page.getByTestId("vertical-separator");
    const boundingBox = (await separator.boundingBox())!;
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y;

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");

    // Centered
    await page.mouse.move(x, y, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("move");

    await page.mouse.down();

    // Moving only in one dimension should not affect the cursor
    await page.mouse.move(x, y - 25, moveConfig);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("move");
  });

  test("disabled group cursor", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group disableCursor orientation="vertical">
        <Panel id="top" minSize="25%" />
        <Separator />
        <Panel id="bottom" minSize="25%" />
      </Group>
    );

    const hitAreaBox = await calculateHitArea(page, ["top", "bottom"]);
    const { x, y } = getCenterCoordinates(hitAreaBox);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");

    await page.mouse.move(x, y, moveConfig);

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");
  });

  test("all panels disabled", async ({ page: mainPage }) => {
    const states = [
      [true, true],
      [true, false],
      [false, true]
    ] satisfies [boolean, boolean][];

    for (const [leftDisabled, rightDisabled] of states) {
      const page = await goToUrl(
        mainPage,
        <Group>
          <Panel disabled={leftDisabled} id="left" />
          <Panel disabled={rightDisabled} id="right" />
        </Group>
      );

      const hitAreaBox = await calculateHitArea(page, ["left", "right"]);
      const { x, y } = getCenterCoordinates(hitAreaBox);

      expect(
        await page.evaluate(() => getComputedStyle(document.body).cursor)
      ).toBe("auto");

      await page.mouse.move(x, y, moveConfig);

      expect(
        await page.evaluate(() => getComputedStyle(document.body).cursor)
      ).toBe("auto");
    }
  });

  test("all but one panels disabled", async ({ page: mainPage }) => {
    const states = [
      [true, true, false],
      [false, true, true],
      [true, false, true]
    ] satisfies [boolean, boolean, boolean][];

    for (const [leftDisabled, centerDisabled, rightDisabled] of states) {
      const page = await goToUrl(
        mainPage,
        <Group>
          <Panel disabled={leftDisabled} id="left" />
          <Panel disabled={centerDisabled} id="center" />
          <Panel disabled={rightDisabled} id="right" />
        </Group>
      );

      expect(
        await page.evaluate(() => getComputedStyle(document.body).cursor)
      ).toBe("auto");

      {
        const hitAreaBox = await calculateHitArea(page, ["left", "center"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);
        await page.mouse.move(x, y, moveConfig);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");
      }

      {
        const hitAreaBox = await calculateHitArea(page, ["center", "right"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);
        await page.mouse.move(x, y, moveConfig);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");
      }
    }
  });

  test("only some panels disabled", async ({ page: mainPage }) => {
    const states = [
      [true, false, false],
      [false, true, false],
      [false, false, true]
    ] satisfies [boolean, boolean, boolean][];

    for (const [leftDisabled, centerDisabled, rightDisabled] of states) {
      const page = await goToUrl(
        mainPage,
        <Group>
          <Panel disabled={leftDisabled} id="left" />
          <Panel disabled={centerDisabled} id="center" />
          <Panel disabled={rightDisabled} id="right" />
        </Group>
      );

      expect(
        await page.evaluate(() => getComputedStyle(document.body).cursor)
      ).toBe("auto");

      if (!leftDisabled) {
        const hitAreaBox = await calculateHitArea(page, ["left", "center"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);
        await page.mouse.move(x, y, moveConfig);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("ew-resize");
      }

      if (!rightDisabled) {
        const hitAreaBox = await calculateHitArea(page, ["center", "right"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);
        await page.mouse.move(x, y, moveConfig);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("ew-resize");
      }
    }
  });

  test("disabled separator", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="left" />
        <Separator disabled id="separator" />
        <Panel id="right" />
      </Group>
    );

    const separator = page.getByTestId("separator");
    const boundingBox = (await separator.boundingBox())!;
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y + boundingBox.height / 2;

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");

    await page.mouse.move(x, y, moveConfig);

    expect(
      await page.evaluate(
        () =>
          getComputedStyle(document.querySelector('[role="separator"]')!).cursor
      )
    ).toBe("not-allowed");
  });

  test("disabled separator within a disabled group", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group disabled>
        <Panel id="left" />
        <Separator disabled id="separator" />
        <Panel id="right" />
      </Group>
    );

    const separator = page.getByTestId("separator");
    const boundingBox = (await separator.boundingBox())!;
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y + boundingBox.height / 2;

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");

    await page.mouse.move(x, y, moveConfig);

    expect(
      await page.evaluate(
        () =>
          getComputedStyle(document.querySelector('[role="separator"]')!).cursor
      )
    ).toBe("not-allowed");
  });

  test("disabled separator within a cursor-disabled group", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group disableCursor>
        <Panel id="left" />
        <Separator disabled id="separator" />
        <Panel id="right" />
      </Group>
    );

    const separator = page.getByTestId("separator");
    const boundingBox = (await separator.boundingBox())!;
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y + boundingBox.height / 2;

    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("auto");

    await page.mouse.move(x, y, moveConfig);

    expect(
      await page.evaluate(
        () =>
          getComputedStyle(document.querySelector('[role="separator"]')!).cursor
      )
    ).toBe("auto");
  });

  test("should not show a cursor at the panel's edge if all panels before or after are disabled", async ({
    page: mainPage
  }) => {
    {
      // All before
      const page = await goToUrl(
        mainPage,
        <Group>
          <Panel disabled id="left" />
          <Panel id="center" />
          <Panel id="right" />
        </Group>
      );

      expect(
        await page.evaluate(() => getComputedStyle(document.body).cursor)
      ).toBe("auto");

      {
        const hitAreaBox = await calculateHitArea(page, ["left", "center"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);
        await page.mouse.move(x, y, moveConfig);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");
      }

      {
        const hitAreaBox = await calculateHitArea(page, ["center", "right"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);
        await page.mouse.move(x, y, moveConfig);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("ew-resize");
      }
    }

    {
      // All before
      const page = await goToUrl(
        mainPage,
        <Group>
          <Panel id="left" />
          <Panel id="center" />
          <Panel disabled id="right" />
        </Group>
      );

      expect(
        await page.evaluate(() => getComputedStyle(document.body).cursor)
      ).toBe("auto");

      {
        const hitAreaBox = await calculateHitArea(page, ["left", "center"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);
        await page.mouse.move(x, y, moveConfig);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("ew-resize");
      }

      {
        const hitAreaBox = await calculateHitArea(page, ["center", "right"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);
        await page.mouse.move(x, y, moveConfig);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");
      }
    }
  });
});
