import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { calculateHitArea } from "../src/utils/calculateHitArea";
import { getCenterCoordinates } from "../src/utils/getCenterCoordinates";
import { goToUrl } from "../src/utils/goToUrl";

test.describe("cursor", () => {
  for (const usePopUpWindow of [true, false]) {
    test.describe(usePopUpWindow ? "in a popup" : "in the main window", () => {
      test("horizontal", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group orientation="horizontal">
            <Panel id="left" minSize="25%" />
            <Separator />
            <Panel id="right" minSize="25%" />
          </Group>,
          { usePopUpWindow }
        );

        const hitAreaBox = await calculateHitArea(page, ["left", "right"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");

        await page.mouse.move(x, y);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("ew-resize");

        await page.mouse.down();
        await page.mouse.move(50, y);
        await page.mouse.move(25, y);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("e-resize");

        await page.mouse.move(950, y);
        await page.mouse.move(975, y);

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
          </Group>,
          { usePopUpWindow }
        );

        const hitAreaBox = await calculateHitArea(page, ["top", "bottom"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");

        await page.mouse.move(x, y);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("ns-resize");

        await page.mouse.down();
        await page.mouse.move(x, 1);
        await page.mouse.move(x, 0);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("s-resize");

        await page.mouse.move(x, 599);
        await page.mouse.move(x, 600);

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
          </Group>,
          { usePopUpWindow }
        );

        const separator = page.getByTestId("vertical-separator");
        const boundingBox = (await separator.boundingBox())!;
        const x = boundingBox.x + boundingBox.width / 2;
        const y = boundingBox.y;

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");

        // Centered
        await page.mouse.move(x, y);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("move");

        // Top left
        await page.mouse.down();
        await page.mouse.move(2, 1);
        await page.mouse.move(1, 1);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("se-resize");

        // Top
        await page.mouse.move(x, 1);
        await page.mouse.move(x, 0);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("s-resize");

        // Top right
        await page.mouse.move(999, 1);
        await page.mouse.move(1000, 1);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("sw-resize");

        // Right
        await page.mouse.move(950, y);
        await page.mouse.move(975, y);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("w-resize");

        // Bottom right
        await page.mouse.move(1000, 599);
        await page.mouse.move(1000, 600);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("nw-resize");

        // Bottom
        await page.mouse.move(x, 599);
        await page.mouse.move(x, 600);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("n-resize");

        // Bottom left
        await page.mouse.move(1, 599);
        await page.mouse.move(1, 600);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("ne-resize");

        // Left
        await page.mouse.move(50, y);
        await page.mouse.move(25, y);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("e-resize");

        // Centered
        await page.mouse.move(x, y);
        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("move");
      });

      test("disabled", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group disableCursor orientation="vertical">
            <Panel id="top" minSize="25%" />
            <Separator />
            <Panel id="bottom" minSize="25%" />
          </Group>,
          { usePopUpWindow }
        );

        const hitAreaBox = await calculateHitArea(page, ["top", "bottom"]);
        const { x, y } = getCenterCoordinates(hitAreaBox);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");

        await page.mouse.move(x, y);

        expect(
          await page.evaluate(() => getComputedStyle(document.body).cursor)
        ).toBe("auto");
      });
    });
  }
});
