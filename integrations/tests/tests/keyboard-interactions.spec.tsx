import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { assertLayoutChangeCounts } from "../src/utils/assertLayoutChangeCounts";
import { getSeparatorAriaAttributes } from "../src/utils/getSeparatorAriaAttributes";
import { goToUrl } from "../src/utils/goToUrl";

// References:
// - https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
// - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role

test.describe("keyboard interactions: window splitter api", () => {
  for (const usePopUpWindow of [true, false]) {
    test.describe(usePopUpWindow ? "in a popup" : "in the main window", () => {
      test("horizontal: arrow keys", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel defaultSize="30%" id="left" minSize="5%" />
            <Separator />
            <Panel id="right" minSize="5%" />
          </Group>,
          { usePopUpWindow }
        );

        await assertLayoutChangeCounts(mainPage, 1);
        await expect(mainPage.getByText('"left": 30')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "95",
          "aria-valuemin": "5",
          "aria-valuenow": "30"
        });

        const separator = page.getByRole("separator");

        await separator.focus();
        await page.keyboard.press("ArrowLeft");

        await assertLayoutChangeCounts(mainPage, 2);
        await expect(mainPage.getByText('"left": 25')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "95",
          "aria-valuemin": "5",
          "aria-valuenow": "25"
        });

        await page.keyboard.press("ArrowRight");

        await assertLayoutChangeCounts(mainPage, 3);
        await expect(mainPage.getByText('"left": 30')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "95",
          "aria-valuemin": "5",
          "aria-valuenow": "30"
        });

        // Up/down are no-ops
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowDown");
        await assertLayoutChangeCounts(mainPage, 3);
      });

      test("vertical: arrow keys", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group orientation="vertical">
            <Panel defaultSize="30%" id="top" minSize="5%" />
            <Separator />
            <Panel id="bottom" minSize="5%" />
          </Group>,
          { usePopUpWindow }
        );

        await assertLayoutChangeCounts(mainPage, 1);
        await expect(mainPage.getByText('"top": 30')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "top",
          "aria-valuemax": "95",
          "aria-valuemin": "5",
          "aria-valuenow": "30"
        });

        const separator = page.getByRole("separator");

        await separator.focus();
        await page.keyboard.press("ArrowDown");

        await assertLayoutChangeCounts(mainPage, 2);
        await expect(mainPage.getByText('"top": 35')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "top",
          "aria-valuemax": "95",
          "aria-valuemin": "5",
          "aria-valuenow": "35"
        });

        await page.keyboard.press("ArrowUp");

        await assertLayoutChangeCounts(mainPage, 3);
        await expect(mainPage.getByText('"top": 30')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "top",
          "aria-valuemax": "95",
          "aria-valuemin": "5",
          "aria-valuenow": "30"
        });

        // Left/right are no-ops
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowRight");
        await assertLayoutChangeCounts(mainPage, 3);
      });

      test("enter key and collapsible panel", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel collapsible collapsedSize="5%" id="left" minSize="20%" />
            <Separator />
            <Panel id="right" minSize="20%" />
          </Group>,
          { usePopUpWindow }
        );

        await assertLayoutChangeCounts(mainPage, 1);
        await expect(mainPage.getByText('"left": 50')).toBeVisible();
        await expect(mainPage.getByText('"right": 50')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "80",
          "aria-valuemin": "5",
          "aria-valuenow": "50"
        });

        const separator = page.getByRole("separator");
        await separator.focus();
        await page.keyboard.press("Enter");

        await assertLayoutChangeCounts(mainPage, 2);
        await expect(mainPage.getByText('"left": 5')).toBeVisible();
        await expect(mainPage.getByText('"right": 95')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "80",
          "aria-valuemin": "5",
          "aria-valuenow": "5"
        });

        await page.keyboard.press("Enter");

        await assertLayoutChangeCounts(mainPage, 3);
        await expect(mainPage.getByText('"left": 50')).toBeVisible();
        await expect(mainPage.getByText('"right": 50')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "80",
          "aria-valuemin": "5",
          "aria-valuenow": "50"
        });

        await page.keyboard.press("ArrowLeft");

        await assertLayoutChangeCounts(mainPage, 4);
        await expect(mainPage.getByText('"left": 45')).toBeVisible();
        await expect(mainPage.getByText('"right": 55')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "80",
          "aria-valuemin": "5",
          "aria-valuenow": "45"
        });

        await page.keyboard.press("Enter");

        await assertLayoutChangeCounts(mainPage, 5);
        await expect(mainPage.getByText('"left": 5')).toBeVisible();
        await expect(mainPage.getByText('"right": 95')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "80",
          "aria-valuemin": "5",
          "aria-valuenow": "5"
        });

        await page.keyboard.press("Enter");

        await assertLayoutChangeCounts(mainPage, 6);
        await expect(mainPage.getByText('"left": 45')).toBeVisible();
        await expect(mainPage.getByText('"right": 55')).toBeVisible();

        await expect(await getSeparatorAriaAttributes(page)).toEqual({
          "aria-controls": "left",
          "aria-valuemax": "80",
          "aria-valuemin": "5",
          "aria-valuenow": "45"
        });
      });

      test("enter key and non-collapsible panel", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel id="left" minSize="20%" />
            <Separator />
            <Panel id="right" minSize="20%" />
          </Group>,
          { usePopUpWindow }
        );

        await assertLayoutChangeCounts(mainPage, 1);
        await expect(mainPage.getByText('"left": 50')).toBeVisible();
        await expect(mainPage.getByText('"right": 50')).toBeVisible();

        const separator = page.getByRole("separator");
        await separator.focus();
        await page.keyboard.press("Enter");

        await assertLayoutChangeCounts(mainPage, 1);
      });

      test("home and end keys", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel id="left" minSize="20%" />
            <Separator />
            <Panel collapsible collapsedSize="5%" id="right" minSize="20%" />
          </Group>,
          { usePopUpWindow }
        );

        await assertLayoutChangeCounts(mainPage, 1);
        await expect(mainPage.getByText('"left": 50')).toBeVisible();
        await expect(mainPage.getByText('"right": 50')).toBeVisible();

        const separator = page.getByRole("separator");

        await separator.focus();
        await page.keyboard.press("Home");

        await assertLayoutChangeCounts(mainPage, 2);
        await expect(mainPage.getByText('"left": 20')).toBeVisible();
        await expect(mainPage.getByText('"right": 80')).toBeVisible();

        await page.keyboard.press("End");

        await assertLayoutChangeCounts(mainPage, 3);
        await expect(mainPage.getByText('"left": 95')).toBeVisible();
        await expect(mainPage.getByText('"right": 5')).toBeVisible();
      });

      test("f6 key cycles through separators", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel />
            <Separator id="separator-left" />
            <Panel />
            <Separator id="separator-center" />
            <div />
            <Separator id="separator-right" />
            <Panel />
          </Group>,
          { usePopUpWindow }
        );

        await page.getByTestId("separator-left").focus();
        await expect(page.getByTestId("separator-left")).toBeFocused();

        await page.keyboard.press("F6");
        await expect(page.getByTestId("separator-center")).toBeFocused();

        await page.keyboard.press("F6");
        await expect(page.getByTestId("separator-right")).toBeFocused();

        await page.keyboard.press("F6");
        await expect(page.getByTestId("separator-left")).toBeFocused();

        await page.keyboard.press("Shift+F6");
        await expect(page.getByTestId("separator-right")).toBeFocused();
      });

      test("should respect when parent Group has been disabled", async ({
        page: mainPage
      }) => {
        const page = await goToUrl(
          mainPage,
          <Group disabled>
            <Panel defaultSize="30%" id="left" minSize="5%" />
            <Separator />
            <Panel id="right" minSize="5%" />
          </Group>,
          { usePopUpWindow }
        );

        await assertLayoutChangeCounts(mainPage, 1);
        await expect(mainPage.getByText('"left": 30')).toBeVisible();

        const separator = page.getByRole("separator");

        await separator.focus();
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.keyboard.press("Home");

        await assertLayoutChangeCounts(mainPage, 1);
        await expect(mainPage.getByText('"left": 30')).toBeVisible();
      });
    });
  }
});
