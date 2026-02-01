import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "../src/utils/goToUrl";

// High level tests; more nuanced scenarios are covered by unit tests
test.describe("default panel sizes", () => {
  test("percentages", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel defaultSize="30%" id="left" minSize={50} />
        <Separator />
        <Panel collapsible defaultSize="0%" id="middle" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText("id: left")).toContainText("30%");
    await expect(page.getByText("id: middle")).toContainText("0%");
    await expect(page.getByText("id: right")).toContainText("70%");
    await expect(page.getByRole("separator")).toHaveCount(2);
  });

  test("pixels", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel defaultSize={200} id="left" minSize={50} />
        <Separator />
        <Panel collapsible defaultSize={0} id="middle" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText("id: left")).toContainText("200px");
    await expect(page.getByText("id: middle")).toContainText("0px");
    await expect(page.getByText("id: right")).toContainText("752px");
    await expect(page.getByRole("separator")).toHaveCount(2);
  });

  test("rems", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel defaultSize="10rem" id="left" minSize={50} />
        <Separator />
        <Panel collapsible defaultSize="0rem" id="middle" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText("id: left")).toContainText("160px");
    await expect(page.getByText("id: middle")).toContainText("0px");
    await expect(page.getByText("id: right")).toContainText("792px");
    await expect(page.getByRole("separator")).toHaveCount(2);
  });

  test("vw", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel defaultSize="25vw" id="left" minSize={50} />
        <Separator />
        <Panel collapsible defaultSize="0vw" id="middle" minSize={50} />
        <Separator />
        <Panel id="right" minSize={50} />
      </Group>
    );

    await expect(page.getByText("id: left")).toContainText("250px");
    await expect(page.getByText("id: middle")).toContainText("0px");
    await expect(page.getByText("id: right")).toContainText("702px");
    await expect(page.getByRole("separator")).toHaveCount(2);
  });
});
