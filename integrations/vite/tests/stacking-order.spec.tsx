import { expect, test } from "@playwright/test";
import { calculateHitArea } from "./utils/calculateHitArea";

test.describe("stacking order", () => {
  test("should ignore pointer events that target overlapping higher z-index targets", async ({
    page
  }) => {
    await page.goto("http://localhost:3012/e2e/stacking-order");

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
    await page.goto("http://localhost:3012/e2e/stacking-order");

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
