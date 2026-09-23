import { expect, test, type Page } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Dialog } from "../src/components/Dialog";
import { assertLayoutChangeCounts } from "../src/utils/assertLayoutChangeCounts";
import { goToUrl } from "../src/utils/goToUrl";

// Covers the entire viewport so that it overlaps any separators behind it
const FULL_SCREEN_DIALOG_CLASS_NAME =
  "fixed inset-0 m-0 p-0 border-0 w-screen h-screen max-w-none max-h-none bg-transparent";

async function drag(page: Page, testId: string, deltaX: number) {
  // Use test ids rather than roles; inert elements are excluded from the accessibility tree
  const box = (await page.getByTestId(testId).boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + deltaX, y);
  await page.mouse.up();
}

test.describe("modal dialogs", () => {
  test("should ignore pointer events on separators behind a modal dialog rendered inside of the group", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="left">
          <Dialog className={FULL_SCREEN_DIALOG_CLASS_NAME}>
            <div>modal dialog</div>
          </Dialog>
        </Panel>
        <Separator id="separator" />
        <Panel id="right" />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);

    await expect(page.getByText("modal dialog")).toBeVisible();

    await drag(page, "separator", 100);
    await expect(page.getByTestId("separator")).not.toHaveAttribute(
      "data-separator",
      "active"
    );
    await assertLayoutChangeCounts(mainPage, 1);

    // Once the dialog is closed, the separator should be interactive again
    await page.evaluate(() => document.querySelector("dialog")!.close());

    await drag(page, "separator", 100);
    await assertLayoutChangeCounts(mainPage, 2);
  });

  test("should only resize groups inside of a modal dialog when separators overlap", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group id="outer-group">
        <Panel id="outer-left">
          <Dialog className="fixed m-0 p-0 border-0 max-w-none max-h-none bg-transparent">
            <Group className="h-full" id="inner-group">
              <Panel id="inner-left" />
              <Separator id="inner-separator" />
              <Panel id="inner-right" />
            </Group>
          </Dialog>
        </Panel>
        <Separator id="outer-separator" />
        <Panel id="outer-right" />
      </Group>
    );

    // Position the dialog exactly over the outer group so that both separators overlap
    await page.evaluate(() => {
      const dialog = document.querySelector("dialog")!;
      const rect = document
        .querySelector('[data-testid="outer-group"]')!
        .getBoundingClientRect();

      dialog.style.top = `${rect.top}px`;
      dialog.style.left = `${rect.left}px`;
      dialog.style.width = `${rect.width}px`;
      dialog.style.height = `${rect.height}px`;
    });

    const outerSeparator = page.getByTestId("outer-separator");
    const innerSeparator = page.getByTestId("inner-separator");

    await expect(async () => {
      const outerBox = (await outerSeparator.boundingBox())!;
      const innerBox = (await innerSeparator.boundingBox())!;

      expect(Math.abs(outerBox.x - innerBox.x)).toBeLessThan(1);
      expect(Math.abs(outerBox.y - innerBox.y)).toBeLessThan(1);
    }).toPass();

    const outerBoxBefore = (await outerSeparator.boundingBox())!;
    const innerBoxBefore = (await innerSeparator.boundingBox())!;

    await drag(page, "inner-separator", 100);

    await expect(async () => {
      const innerBoxAfter = (await innerSeparator.boundingBox())!;

      expect(innerBoxAfter.x - innerBoxBefore.x).toBeGreaterThan(50);
    }).toPass();

    const outerBoxAfter = (await outerSeparator.boundingBox())!;
    expect(outerBoxAfter.x).toBeCloseTo(outerBoxBefore.x, 0);
  });

  test("should not ignore pointer events on separators behind a non-modal dialog", async ({
    page: mainPage
  }) => {
    // Content behind a non-modal dialog remains interactive,
    // so this case is intentionally not handled (same as any other overlay inside of the group)
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="left">
          <Dialog className={FULL_SCREEN_DIALOG_CLASS_NAME} modal={false}>
            <div>non-modal dialog</div>
          </Dialog>
        </Panel>
        <Separator id="separator" />
        <Panel id="right" />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);

    await expect(page.getByText("non-modal dialog")).toBeVisible();

    await drag(page, "separator", 100);
    await assertLayoutChangeCounts(mainPage, 2);
  });
});
