import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Container } from "../src/components/Container";
import { assertLayoutChangeCounts } from "../src/utils/assertLayoutChangeCounts";
import { calculateHitArea } from "../src/utils/calculateHitArea";
import { goToUrl } from "../src/utils/goToUrl";

test.describe("stacking order", () => {
  for (const usePopUpWindow of [true, false]) {
    test.describe(usePopUpWindow ? "in a popup" : "in the main window", () => {
      test("should ignore pointer events that target overlapping higher z-index targets", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <Container className="relative">
            <Group className="w-25 h-25 min-h-25">
              <Panel id="left" />
              <Separator id="separator" />
              <Panel id="center" />
              <Panel id="right" />
            </Group>
            <div className="bg-red-600 absolute left-[30%] top-0 p-2">
              blocker
            </div>
            <div className="bg-red-600 absolute left-[65%] top-0 p-2">
              blocker
            </div>
          </Container>,
          { usePopUpWindow }
        );

        await assertLayoutChangeCounts(mainPage, 1);

        const box = (await page.getByRole("separator").boundingBox())!;

        await page.mouse.move(box.x, box.y);
        await page.mouse.down();
        await page.mouse.move(0, 0);
        await page.mouse.up();

        await assertLayoutChangeCounts(mainPage, 1);

        const hitAreaBox = await calculateHitArea(page, ["center", "right"]);

        await page.mouse.move(hitAreaBox.x, hitAreaBox.y);
        await page.mouse.down();
        await page.mouse.move(1000, 0);
        await page.mouse.up();

        await assertLayoutChangeCounts(mainPage, 1);
      });

      test("should allow pointer events that target nearby but not overlapping higher z-index targets", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <Container className="relative">
            <Group className="w-25 h-25 min-h-25">
              <Panel id="left" />
              <Separator id="separator" />
              <Panel id="center" />
              <Panel id="right" />
            </Group>
            <div className="bg-red-600 absolute left-[30%] top-0 p-2">
              blocker
            </div>
            <div className="bg-red-600 absolute left-[65%] top-0 p-2">
              blocker
            </div>
          </Container>,
          { usePopUpWindow }
        );

        await assertLayoutChangeCounts(mainPage, 1);

        const box = (await page.getByRole("separator").boundingBox())!;

        await page.mouse.move(box.x, box.y + box.height);
        await page.mouse.down();
        await page.mouse.move(0, 0);
        await page.mouse.up();

        await assertLayoutChangeCounts(mainPage, 2);

        const hitAreaBox = await calculateHitArea(page, ["center", "right"]);

        await page.mouse.move(hitAreaBox.x, hitAreaBox.y + hitAreaBox.height);
        await page.mouse.down();
        await page.mouse.move(1000, 0);
        await page.mouse.up();

        await assertLayoutChangeCounts(mainPage, 3);
      });

      test("should allow resizes that originate outside of an overlapping element and then move beneath it", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <Container className="relative">
            <Group className="w-25 h-25 min-h-25">
              <Panel id="left" />
              <Separator id="separator" />
              <Panel id="right" />
            </Group>
            <div className="bg-red-600 absolute left-0 top-0 p-2">blocker</div>
          </Container>,
          { usePopUpWindow }
        );

        const separator = page.getByRole("separator");
        const panelBox = (await page.getByText("id: left").boundingBox())!;
        const separatorBox = (await separator.boundingBox())!;

        await assertLayoutChangeCounts(mainPage, 1);

        await page.mouse.move(separatorBox.x, separatorBox.y);
        await expect(separator).toHaveAttribute("data-separator", "hover");

        await page.mouse.down();
        await expect(separator).toHaveAttribute("data-separator", "active");
        await assertLayoutChangeCounts(mainPage, 1);

        await page.mouse.move(panelBox.x, separatorBox.y);
        await expect(separator).toHaveAttribute("data-separator", "active");
        await assertLayoutChangeCounts(mainPage, 2, 1);

        await page.mouse.move(panelBox.x + 25, separatorBox.y);
        await expect(separator).toHaveAttribute("data-separator", "active");
        await assertLayoutChangeCounts(mainPage, 3, 1);

        // Releasing the cursor under the overlaid element should do two things:
        // It should deactivate the separator
        // It should transition to an "inactive" state because it's now blocked
        await page.mouse.up();
        await expect(separator).toHaveAttribute("data-separator", "inactive");
        await assertLayoutChangeCounts(mainPage, 3, 2);

        // No-op
        await page.mouse.down();
        await page.mouse.move(separatorBox.x, separatorBox.y);
        await page.mouse.up();
        await assertLayoutChangeCounts(mainPage, 3, 2);
      });
    });
  }
});
