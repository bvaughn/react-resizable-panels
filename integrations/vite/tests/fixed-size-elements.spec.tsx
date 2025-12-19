import { expect, test } from "@playwright/test";

test.describe("fixed size elements", () => {
  test("should not be interactive directly", async ({ page }) => {
    await page.goto("http://localhost:3012/e2e/fixed-size-elements");

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();

    for (const text of ["foo+bar", "bar+baz", "baz+qux"]) {
      const box = (await page.getByText(text).boundingBox())!;

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(0, 0);
      await page.mouse.up();
    }

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
  });

  test("should work without an explicit separator", async ({ page }) => {
    await page.goto("http://localhost:3012/e2e/fixed-size-elements");

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();

    const boxFoo = (await page.getByText("id: foo").boundingBox())!;

    await page.mouse.move(boxFoo.x + boxFoo.width, boxFoo.y);
    await page.mouse.down();
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();

    const boxBar = (await page.getByText("id: bar").boundingBox())!;

    await page.mouse.move(boxBar.x, boxBar.y);
    await page.mouse.down();
    await page.mouse.move(1000, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
  });

  test("should work with an explicit separator", async ({ page }) => {
    await page.goto("http://localhost:3012/e2e/fixed-size-elements");

    const separatorBox = (await page.getByTestId("bar+baz").boundingBox())!;

    await page.mouse.move(separatorBox.x, separatorBox.y);
    await page.mouse.down();
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();

    const boxBar = (await page.getByText("id: baz").boundingBox())!;

    await page.mouse.move(boxBar.x, boxBar.y);
    await page.mouse.down();
    await page.mouse.move(1000, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
  });

  test("should work with two explicit separators", async ({ page }) => {
    await page.goto("http://localhost:3012/e2e/fixed-size-elements");

    let separatorBox = (await page.getByTestId("baz+qux+left").boundingBox())!;

    await page.mouse.move(separatorBox.x, separatorBox.y);
    await page.mouse.down();
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();

    separatorBox = (await page.getByTestId("baz+qux+right").boundingBox())!;

    await page.mouse.move(separatorBox.x, separatorBox.y);
    await page.mouse.down();
    await page.mouse.move(1000, 0);
    await page.mouse.up();

    await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
  });
});
