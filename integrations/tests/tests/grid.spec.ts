import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(process.env.GRID_TEST_URL ?? "http://localhost:3012/grid");
});

test("shared tracks resize together and intersections resize both axes", async ({
  page
}) => {
  const grid = await page.getByTestId("grid").boundingBox();
  expect(grid).not.toBeNull();
  await expect
    .poll(async () => (await page.getByTestId("a").boundingBox())?.width)
    .toBe(400);
  await page.mouse.move(grid!.x + 402, grid!.y + 202);
  await page.mouse.down();
  await page.mouse.move(grid!.x + 502, grid!.y + 252);
  await page.mouse.up();
  for (const id of ["a", "c"])
    expect((await page.getByTestId(id).boundingBox())!.width).toBeCloseTo(500);
  for (const id of ["a", "b"])
    expect((await page.getByTestId(id).boundingBox())!.height).toBeCloseTo(250);
  await expect(page.getByTestId("layout")).toHaveText(
    '{"rows":{"0":62.5,"1":37.5},"columns":{"0":62.5,"1":37.5}}'
  );
});

test("spans mask separators while the remaining segment resizes the columns", async ({
  page
}) => {
  await page.getByRole("button", { name: "Toggle span" }).click();
  await expect(page.getByTestId("b")).toHaveCount(0);
  const top = await page.getByTestId("a").boundingBox();
  const separator = await page
    .getByRole("separator", { name: "Columns" })
    .boundingBox();
  expect(top!.width).toBe(804);
  expect(separator!.y).toBeGreaterThanOrEqual(top!.y + top!.height);
  await page.getByRole("separator", { name: "Columns" }).focus();
  await page.keyboard.press("ArrowRight");
  expect((await page.getByTestId("c").boundingBox())!.width).toBeCloseTo(440);
  expect((await page.getByTestId("a").boundingBox())!.width).toBe(804);
  await page.keyboard.press("End");
  expect((await page.getByTestId("d").boundingBox())!.width).toBeCloseTo(100);
});

test("disabled grids keep both keyboard and pointer layouts unchanged", async ({
  page
}) => {
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(
    page.getByRole("separator", { name: "Columns" })
  ).toHaveAttribute("aria-disabled", "true");
  const grid = (await page.getByTestId("grid").boundingBox())!;
  await page.mouse.move(grid.x + 402, grid.y + 100);
  await page.mouse.down();
  await page.mouse.move(grid.x + 502, grid.y + 100);
  await page.mouse.up();
  expect((await page.getByTestId("a").boundingBox())!.width).toBe(400);
});
