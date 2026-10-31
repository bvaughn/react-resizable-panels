import { expect, test, type Locator, type Page } from "@playwright/test";
import { Workspace, type WorkspaceModel } from "react-resizable-panels";
import { goToUrl } from "../src/utils/goToUrl";

function createModel({
  leftMinWidth
}: { leftMinWidth?: string } = {}): WorkspaceModel {
  return {
    root: {
      children: [
        {
          id: "left",
          minWidth: leftMinWidth,
          tabs: [
            { data: null, id: "a" },
            { data: null, id: "b" }
          ],
          type: "tabset"
        },
        {
          id: "right",
          tabs: [{ data: null, id: "c" }],
          type: "tabset"
        }
      ],
      id: "root",
      orientation: "horizontal",
      type: "split"
    },
    version: 1
  };
}

// The test serializer only supports library components (not custom components),
// so this helper must be called as a function rather than rendered as an element
function workspace(model: WorkspaceModel = createModel()) {
  // Render functions are provided by the test Workspace component
  return <Workspace defaultModel={model} renderTabContent={() => null} />;
}

function getTab(page: Page, id: string) {
  return page.locator(`[data-tab-id="${id}"]`);
}

function getTabset(page: Page, id: string) {
  return page.locator(`[data-tabset-id="${id}"]`);
}

async function getTabIds(tabset: Locator) {
  return tabset
    .locator("[data-tab]")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-tab-id"))
    );
}

async function getLastChange(page: Page) {
  const changes = JSON.parse(
    (await page.getByTestId("workspace-changes").textContent()) ?? "[]"
  );

  return changes[changes.length - 1];
}

async function drag(page: Page, from: Locator, to: { x: number; y: number }) {
  const box = (await from.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.mouse.up();
}

async function getPanelsPoint(
  tabset: Locator,
  region: "bottom" | "center" | "left" | "right" | "top"
) {
  const box = (await tabset.locator("[data-tab-panels]").boundingBox())!;
  const inset = 10;

  switch (region) {
    case "bottom":
      return { x: box.x + box.width / 2, y: box.y + box.height - inset };
    case "center":
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    case "left":
      return { x: box.x + inset, y: box.y + box.height / 2 };
    case "right":
      return { x: box.x + box.width - inset, y: box.y + box.height / 2 };
    case "top":
      return { x: box.x + box.width / 2, y: box.y + inset };
  }
}

test.describe("Workspace", () => {
  test("moves a tab into another tabset without remounting its content", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, workspace());

    await page.getByTestId("content-a").click();
    await expect(page.getByTestId("content-a")).toHaveText("a: 1");

    await drag(
      page,
      getTab(page, "a"),
      await getPanelsPoint(getTabset(page, "right"), "center")
    );

    expect(await getTabIds(getTabset(page, "left"))).toEqual(["b"]);
    expect(await getTabIds(getTabset(page, "right"))).toEqual(["c", "a"]);
    await expect(getTab(page, "a")).toHaveAttribute("aria-selected", "true");
    await expect(getTabset(page, "right").getByTestId("content-a")).toHaveText(
      "a: 1"
    );

    expect((await getLastChange(page)).meta).toEqual({
      isUserInteraction: true,
      reason: "move"
    });
  });

  test("splits a tabset when a tab is dropped onto its edge", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, workspace());

    await page.getByTestId("content-a").click();

    await drag(
      page,
      getTab(page, "a"),
      await getPanelsPoint(getTabset(page, "right"), "bottom")
    );

    await expect(page.locator("[data-tabset]")).toHaveCount(3);

    // The new tabset is below the right tabset, and they share its space
    const right = (await getTabset(page, "right").boundingBox())!;
    const added = (await getTab(page, "a")
      .locator("xpath=ancestor::*[@data-tabset]")
      .boundingBox())!;
    expect(added.x).toBe(right.x);
    expect(added.y).toBeGreaterThan(right.y);
    expect(Math.abs(added.height - right.height)).toBeLessThanOrEqual(1);

    await expect(page.getByTestId("content-a")).toHaveText("a: 1");
  });

  test("applies the model's sizes when a split's children change", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, workspace());

    const root = (await page.locator("[data-workspace]").boundingBox())!;
    const getLeftPercentage = async () =>
      ((await getTabset(page, "left").boundingBox())!.width / root.width) * 100;

    // Resize to 40/60 (the Group remembers this layout for these panels)
    const separator = page.locator("[data-separator]");
    const box = (await separator.boundingBox())!;
    await drag(page, separator, {
      x: root.x + root.width * 0.4,
      y: box.y + box.height / 2
    });
    expect(await getLeftPercentage()).toBeCloseTo(40, 0);

    // Split the right tabset (left 40, right 30, new 30), then close the new tabset's only tab
    await drag(
      page,
      getTab(page, "a"),
      await getPanelsPoint(getTabset(page, "right"), "right")
    );
    await expect(page.locator("[data-tabset]")).toHaveCount(3);
    await getTab(page, "a").focus();
    await page.keyboard.press("Delete");
    await expect(page.locator("[data-tabset]")).toHaveCount(2);

    // The remaining sizes are scaled (to about 57/43, less the separator), rather than restored to the remembered layout (40/60)
    const leftPercentage = await getLeftPercentage();
    expect(leftPercentage).toBeGreaterThan(55);
    expect(leftPercentage).toBeLessThan(58);
  });

  test("reorders tabs within a tab list", async ({ page: mainPage }) => {
    const page = await goToUrl(mainPage, workspace());

    const b = (await getTab(page, "b").boundingBox())!;
    await drag(page, getTab(page, "a"), {
      x: b.x + b.width - 2,
      y: b.y + b.height / 2
    });

    expect(await getTabIds(getTabset(page, "left"))).toEqual(["b", "a"]);
  });

  test("enforces minimum content sizes", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      workspace(createModel({ leftMinWidth: "300px" }))
    );

    const separator = page.locator("[data-separator]");
    const box = (await separator.boundingBox())!;
    await drag(page, separator, { x: box.x - 300, y: box.y + box.height / 2 });

    const left = (await getTabset(page, "left").boundingBox())!;
    expect(left.width).toBe(300);
  });

  test("closes a tab from the keyboard and focuses its neighbor", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, workspace());

    await getTab(page, "a").focus();
    await page.keyboard.press("ArrowRight");
    await expect(getTab(page, "b")).toBeFocused();
    await expect(getTab(page, "a")).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Enter");
    await expect(getTab(page, "b")).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Delete");
    await expect(getTab(page, "b")).toHaveCount(0);
    await expect(getTab(page, "a")).toBeFocused();

    expect((await getLastChange(page)).meta).toEqual({
      isUserInteraction: true,
      reason: "close"
    });
  });
});
