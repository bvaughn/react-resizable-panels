import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  Cell,
  Grid,
  Gridline,
  Group,
  Panel,
  Separator
} from "react-resizable-panels";
import { getColumnGridline } from "../src/utils/grid";
import { goToUrl } from "../src/utils/goToUrl";

// Pointer coordinates include an ancestor's CSS zoom or scale transform, but layout sizes (e.g. offsetWidth) don't;
// either way, a separator should follow the pointer
const SCALING = [
  { css: "zoom: 2", name: "zoom" },
  {
    css: "transform: scale(0.5); transform-origin: 0 0",
    name: "scale transform"
  }
];

async function dragBy(page: Page, separator: Locator, deltaX: number) {
  const box = (await separator.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(20, box.height / 2);

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + deltaX, y, { steps: 8 });
  await page.mouse.up();

  const after = (await separator.boundingBox())!;
  return after.x - box.x;
}

test.describe("CSS scaling", () => {
  for (const { css, name } of SCALING) {
    test(`a Group separator follows the pointer with ${name}`, async ({
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
      await page.addStyleTag({ content: `body { ${css} }` });

      const moved = await dragBy(page, page.getByRole("separator"), 60);
      expect(moved).toBeCloseTo(60, 0);
    });

    test(`a Grid gridline follows the pointer with ${name}`, async ({
      page: mainPage
    }) => {
      const page = await goToUrl(
        mainPage,
        <Grid columns={2} rows={1}>
          <Cell column={0} row={0} />
          <Cell column={1} row={0} />
          <Gridline column={1} type="column" />
        </Grid>
      );
      await page.addStyleTag({ content: `body { ${css} }` });

      const moved = await dragBy(page, getColumnGridline(page), 60);
      expect(moved).toBeCloseTo(60, 0);
    });
  }
});
