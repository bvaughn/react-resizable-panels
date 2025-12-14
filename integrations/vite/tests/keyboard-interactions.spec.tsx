import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";

test.describe("keyboard interactions", () => {
  // See https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
  test.describe("window splitter api", () => {
    test.skip("horizontal: arrow keys", async ({ page }) => {
      await goToUrl(
        page,
        <Group disabled>
          <Panel defaultSize="30%" id="left" minSize={50} />
          <Separator />
          <Panel id="right" minSize={50} />
        </Group>
      );

      await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
      await expect(page.getByText('"left": 30')).toBeVisible();

      const separator = page.getByRole("separator");

      await separator.focus();
      await page.keyboard.press("ArrowLeft");

      await expect(page.getByText('"onLayoutCount": 2')).toBeVisible();
      await expect(page.getByText('"left": 30')).toBeVisible();

      await page.keyboard.press("ArrowRight");

      await expect(page.getByText('"onLayoutCount": 3')).toBeVisible();
      await expect(page.getByText('"left": 30')).toBeVisible();
    });

    test.skip("vertical: arrow keys", async ({ page }) => {
      console.log(page); // TODO
    });

    test.skip("enter key and collapsible panel", async ({ page }) => {
      console.log(page); // TODO
    });

    test.skip("home/end keys", async ({ page }) => {
      console.log(page); // TODO
    });

    test("f6 key cycles through separators", async ({ page }) => {
      await goToUrl(
        page,
        <Group disabled>
          <Panel />
          <Separator id="separator-left" />
          <Panel />
          <Separator id="separator-center" />
          <Panel />
          <Separator id="separator-right" />
          <Panel />
        </Group>
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
  });

  test("should be disabled when disabled", async ({ page }) => {
    await goToUrl(
      page,
      <Group disabled>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();

    const separator = page.getByRole("separator");

    await separator.focus();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Home");

    await expect(page.getByText('"onLayoutCount": 1')).toBeVisible();
    await expect(page.getByText('"left": 30')).toBeVisible();
  });
});
