import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";

// High level tests; more nuanced scenarios are covered by unit tests
test.describe("default panel sizes", () => {
  for (const usePopUpWindow of [true, false]) {
    test.describe(usePopUpWindow ? "in a popup" : "in the main window", () => {
      test("percentages", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel defaultSize="30%" id="left" minSize={50} />
            <Separator />
            <Panel id="right" minSize={50} />
          </Group>,
          { usePopUpWindow }
        );

        await expect(page.getByText("id: left")).toContainText("30%");
        await expect(page.getByRole("separator")).toBeVisible();
        await expect(page.getByText("id: right")).toContainText("70%");
      });

      test("pixels", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel defaultSize={200} id="left" minSize={50} />
            <Separator />
            <Panel id="right" minSize={50} />
          </Group>,
          { usePopUpWindow }
        );

        await expect(page.getByText("id: left")).toContainText("200px");
        await expect(page.getByRole("separator")).toBeVisible();
        await expect(page.getByText("id: right")).toContainText("776px");
      });

      test("rems", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel defaultSize="10rem" id="left" minSize={50} />
            <Separator />
            <Panel id="right" minSize={50} />
          </Group>,
          { usePopUpWindow }
        );

        await expect(page.getByText("id: left")).toContainText("160px");
        await expect(page.getByRole("separator")).toBeVisible();
        await expect(page.getByText("id: right")).toContainText("816px");
      });

      test("vw", async ({ page: mainPage }) => {
        const page = await goToUrl(
          mainPage,
          <Group>
            <Panel defaultSize="25vw" id="left" minSize={50} />
            <Separator />
            <Panel id="right" minSize={50} />
          </Group>,
          { usePopUpWindow }
        );

        await expect(page.getByText("id: left")).toContainText("250px");
        await expect(page.getByRole("separator")).toBeVisible();
        await expect(page.getByText("id: right")).toContainText("726px");
      });
    });
  }
});
