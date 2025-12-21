import { expect, test, type Page } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Container } from "../src/components/Container";
import { calculateHitArea } from "./utils/calculateHitArea";
import { goToUrl } from "./utils/goToUrl";

test.describe("stacking order", () => {
  async function init(page: Page) {
    await goToUrl(
      page,
      <Container className="relative">
        <Group className="w-25 h-25 min-h-25">
          <Panel id="left" />
          <Separator id="separator" />
          <Panel id="center" />
          <Panel id="right" />
        </Group>
        <div className="bg-red-600 absolute left-[30%] top-0 p-2">blocker</div>
        <div className="bg-red-600 absolute left-[65%] top-0 p-2">blocker</div>
      </Container>
    );
  }

  test("should ignore pointer events that target overlapping higher z-index targets", async ({
    page
  }) => {
    await init(page);

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();

    const box = (await page.getByRole("separator").boundingBox())!;

    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();

    const hitAreaBox = await calculateHitArea(page, ["center", "right"]);

    await page.mouse.move(hitAreaBox.x, hitAreaBox.y);
    await page.mouse.down();
    await page.mouse.move(1000, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
  });

  test("should allow pointer events that target nearby but not overlapping higher z-index targets", async ({
    page
  }) => {
    await init(page);

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();

    const box = (await page.getByRole("separator").boundingBox())!;

    await page.mouse.move(box.x, box.y + box.height);
    await page.mouse.down();
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();

    const hitAreaBox = await calculateHitArea(page, ["center", "right"]);

    await page.mouse.move(hitAreaBox.x, hitAreaBox.y + hitAreaBox.height);
    await page.mouse.down();
    await page.mouse.move(1000, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
  });
});
