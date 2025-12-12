import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";

test.describe("default panel sizes", () => {
  test("percentages", async ({ page }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText("id: left")).toContainText("30%");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("70%");
  });

  test("pixels", async ({ page }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize={200} id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText("id: left")).toContainText("200px");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("760px");
  });

  test("rems", async ({ page }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="10rem" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText("id: left")).toContainText("160px");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("800px");
  });

  test("vw", async ({ page }) => {
    await goToUrl(
      page,
      <Group>
        <Panel defaultSize="25vw" id="left" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText("id: left")).toContainText("250px");
    await expect(page.getByRole("separator")).toBeVisible();
    await expect(page.getByText("id: right")).toContainText("710px");
  });
});
