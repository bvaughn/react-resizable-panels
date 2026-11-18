import { expect, test, type Page } from "@playwright/test";
import type { ReactElement } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Container } from "../src/components/Container";
import { Popover } from "../src/components/Popover";
import { assertLayoutChangeCounts } from "../src/utils/assertLayoutChangeCounts";
import { goToUrl } from "../src/utils/goToUrl";

// Covers the entire viewport so that it overlaps any separators behind it
const FULL_SCREEN_POPOVER_CLASS_NAME =
  "fixed inset-0 m-0 p-0 border-0 w-screen h-screen max-w-none max-h-none bg-transparent";

const SMALL_POPOVER_CLASS_NAME =
  "fixed top-0 left-0 m-0 p-0 border-0 w-5 h-5 overflow-hidden";

async function drag(page: Page, testId: string, deltaX: number) {
  const box = (await page.getByTestId(testId).boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + deltaX, y);
  await page.mouse.up();
}

function renderGroup(popover: ReactElement<unknown>, container: string) {
  return container === "panel" ? (
    <Group>
      <Panel id="left">{popover}</Panel>
      <Separator id="separator" />
      <Panel id="right" />
    </Group>
  ) : (
    <Container>
      {popover}
      <Group>
        <Panel id="left" />
        <Separator id="separator" />
        <Panel id="right" />
      </Group>
    </Container>
  );
}

test.describe("popovers", () => {
  for (const container of ["body", "panel"] as const) {
    test(`should ignore pointer events on separators behind an open popover (in the ${container})`, async ({
      page: mainPage
    }) => {
      const page = await goToUrl(
        mainPage,
        renderGroup(
          <Popover className={FULL_SCREEN_POPOVER_CLASS_NAME}>
            <div>popover</div>
          </Popover>,
          container
        )
      );

      await assertLayoutChangeCounts(mainPage, 1);

      await expect(page.getByText("popover", { exact: true })).toBeVisible();

      await drag(page, "separator", 100);
      await expect(page.getByTestId("separator")).not.toHaveAttribute(
        "data-separator",
        "active"
      );
      await assertLayoutChangeCounts(mainPage, 1);

      // Once the popover is closed, the separator should be interactive again
      await page.evaluate(() =>
        document.querySelector<HTMLElement>("[popover]")!.hidePopover()
      );

      await drag(page, "separator", 100);
      await assertLayoutChangeCounts(mainPage, 2);
    });

    test(`should not ignore pointer events on separators while a popover elsewhere is open (in the ${container})`, async ({
      page: mainPage
    }) => {
      const page = await goToUrl(
        mainPage,
        renderGroup(
          <Popover className={SMALL_POPOVER_CLASS_NAME}>
            <div>popover</div>
          </Popover>,
          container
        )
      );

      await assertLayoutChangeCounts(mainPage, 1);

      await expect(page.getByText("popover", { exact: true })).toBeVisible();

      await drag(page, "separator", 100);
      await assertLayoutChangeCounts(mainPage, 2);
    });
  }
});
