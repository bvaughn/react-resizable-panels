import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  Workspace,
  type SplitNode,
  type TabsetNode,
  type WorkspaceModel
} from "react-resizable-panels";
import { SEPARATOR_SIZE } from "../src/components/Workspace";
import { goToUrl } from "../src/utils/goToUrl";

function createModel({
  leftMaxWidth,
  leftMinWidth
}: { leftMaxWidth?: string; leftMinWidth?: string } = {}): WorkspaceModel {
  return {
    root: {
      children: [
        {
          id: "left",
          maxWidth: leftMaxWidth,
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

async function drag(
  page: Page,
  from: Locator | { x: number; y: number },
  to: { x: number; y: number }
) {
  const start =
    "x" in from
      ? from
      : await from.boundingBox().then((box) => ({
          x: box!.x + box!.width / 2,
          y: box!.y + box!.height / 2
        }));

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 10 });
  await page.mouse.up();
}

// Tabs are pressed by their labels: the center of a tab can be on its close button (depending on font metrics),
// and pressing a button within a tab doesn't select or drag it (clicking a tab's close button closes it)
async function getTabLabelPoint(tab: Locator) {
  const box = (await tab.boundingBox())!;
  const closeButton = await tab.getByRole("button").boundingBox();

  // Midway between the tab's start and its close button (or its center, if it doesn't have one)
  const x = closeButton ? (box.x + closeButton.x) / 2 : box.x + box.width / 2;

  return { x, y: box.y + box.height / 2 };
}

async function clickTab(page: Page, tab: Locator) {
  const { x, y } = await getTabLabelPoint(tab);

  await page.mouse.click(x, y);
}

async function dragTab(page: Page, tab: Locator, to: { x: number; y: number }) {
  await drag(page, await getTabLabelPoint(tab), to);
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

    await dragTab(
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

    await dragTab(
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

  test("moves a tabset by the empty space in its header without remounting its content", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, workspace());

    await page.getByTestId("content-a").click();

    // The header's empty space is after its tabs
    const header = (await getTabset(page, "left")
      .locator("[data-tabset-header]")
      .boundingBox())!;
    await drag(
      page,
      { x: header.x + header.width - 10, y: header.y + header.height / 2 },
      await getPanelsPoint(getTabset(page, "right"), "bottom")
    );

    // The tabset is below the right tabset, and they share its space
    const right = (await getTabset(page, "right").boundingBox())!;
    const left = (await getTabset(page, "left").boundingBox())!;
    expect(left.x).toBe(right.x);
    expect(left.y).toBeGreaterThan(right.y);
    expect(await getTabIds(getTabset(page, "left"))).toEqual(["a", "b"]);
    expect(await getLastChange(page)).toMatchObject({
      meta: { isUserInteraction: true, reason: "move" }
    });

    await expect(page.getByTestId("content-a")).toHaveText("a: 1");
  });

  test("collapses a tabset to its header, and expands it when a tab is clicked", async ({
    page: mainPage
  }) => {
    const model = createModel();
    const root = model.root as SplitNode;
    root.children[1] = {
      ...(root.children[1] as TabsetNode),
      collapsed: true,
      collapsible: true,
      size: 40
    };
    const page = await goToUrl(mainPage, workspace(model));

    // Tabs placed on top run vertically while the tabset is collapsed within a horizontal split,
    // and it's as wide as its header's content
    // (this app doesn't style vertical tab lists, so that's the width of its tab)
    const right = getTabset(page, "right");
    await expect(right).toHaveAttribute("data-tab-placement", "right");
    const collapsedWidth = (await right.boundingBox())!.width;
    const tabWidth = (await getTab(page, "c").boundingBox())!.width;
    expect(Math.abs(collapsedWidth - tabWidth)).toBeLessThanOrEqual(1);

    await clickTab(page, getTab(page, "c"));

    await expect(right).not.toHaveAttribute("data-tabset-collapsed");
    const workspaceWidth = 808 - SEPARATOR_SIZE;
    expect(
      Math.abs((await right.boundingBox())!.width - workspaceWidth * 0.4)
    ).toBeLessThanOrEqual(1);
    expect(await getLastChange(page)).toMatchObject({
      meta: { isUserInteraction: true, reason: "expand" }
    });
  });

  test("shows a tabset collapsed (or expanded) while its separator is dragged, before the pointer is released", async ({
    page: mainPage
  }) => {
    const model = createModel();
    const root = model.root as SplitNode;
    root.children[1] = {
      ...(root.children[1] as TabsetNode),
      collapsible: true,
      size: 40
    };
    const page = await goToUrl(mainPage, workspace(model));

    const right = getTabset(page, "right");
    const workspaceBox = (await page
      .locator("[data-workspace]")
      .boundingBox())!;
    const separator = (await page.locator("[data-separator]").boundingBox())!;
    const y = separator.y + separator.height / 2;

    // Collapse: the tabset only shows its header as soon as it reaches its collapsed size
    await page.mouse.move(separator.x + separator.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(workspaceBox.x + workspaceBox.width - 5, y, {
      steps: 10
    });
    await expect(right).toHaveAttribute("data-tabset-collapsed", "true");
    await expect(right.locator("[data-tab-panels]")).toBeHidden();

    await page.mouse.up();
    await expect(right).toHaveAttribute("data-tabset-collapsed", "true");
    expect(await getLastChange(page)).toMatchObject({
      meta: { isUserInteraction: true, reason: "collapse" }
    });

    // Expand: its content is shown again as soon as it's dragged past its collapsed size
    const collapsedSeparator = (await page
      .locator("[data-separator]")
      .boundingBox())!;
    await page.mouse.move(
      collapsedSeparator.x + collapsedSeparator.width / 2,
      y
    );
    await page.mouse.down();
    await page.mouse.move(workspaceBox.x + workspaceBox.width * 0.5, y, {
      steps: 10
    });
    await expect(right).not.toHaveAttribute("data-tabset-collapsed");
    await expect(right.locator("[data-tab-panels]")).toBeVisible();

    await page.mouse.up();
    await expect(right).not.toHaveAttribute("data-tabset-collapsed");
    expect(await getLastChange(page)).toMatchObject({
      meta: { isUserInteraction: true, reason: "expand" }
    });
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
    await dragTab(
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
    await dragTab(page, getTab(page, "a"), {
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

  test("enforces maximum content sizes", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      workspace(createModel({ leftMaxWidth: "300px" }))
    );

    // The tabsets start at half of the workspace each, which is more than the maximum
    const left = getTabset(page, "left");
    await expect.poll(async () => (await left.boundingBox())!.width).toBe(300);

    const separator = page.locator("[data-separator]");
    let box = (await separator.boundingBox())!;
    await drag(page, separator, { x: box.x + 200, y: box.y + box.height / 2 });
    expect((await left.boundingBox())!.width).toBe(300);

    box = (await separator.boundingBox())!;
    await drag(page, separator, {
      x: box.x + box.width / 2 - 100,
      y: box.y + box.height / 2
    });
    expect((await left.boundingBox())!.width).toBe(200);
  });

  test("reports the free space in tab lists, and renders it before the browser paints", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Workspace
        defaultModel={createModel()}
        renderTabContent={() => null}
        // A test-only prop (see the test app's Workspace)
        {...({ showTabListFreeSpace: true } as object)}
      />
    );

    const tabList = getTabset(page, "left").locator("[data-tab-list]");
    const freeSpace = page.getByTestId("free-space-left");

    // The list's width, less the space between the start of its first tab and the end of its last one
    const expected = await tabList.evaluate((list) => {
      const rects = Array.from(list.children).map((child) =>
        child.getBoundingClientRect()
      );
      const start = Math.min(...rects.map(({ left }) => left));
      const end = Math.max(...rects.map(({ right }) => right));
      return Math.round(list.getBoundingClientRect().width - (end - start));
    });
    expect(expected).toBeGreaterThan(0);
    await expect(freeSpace).toHaveText(String(expected));
    await expect(tabList).toHaveCSS("--tab-list-free-space", `${expected}px`);

    // An observer created after the Workspace's is called after it in the same frame (before the browser paints),
    // so the value the toolbar renders has to match the one that was just measured
    const records = await page
      .locator("[data-workspace]")
      .evaluate(async (workspace: HTMLElement) => {
        const window = workspace.ownerDocument.defaultView!;
        const list = workspace.querySelector<HTMLElement>(
          '[data-tabset-id="left"] [data-tab-list]'
        )!;
        const label = workspace.querySelector(
          '[data-testid="free-space-left"]'
        )!;
        const nextFrame = () =>
          new Promise((resolve) => window.requestAnimationFrame(resolve));

        const records: { measured: string; rendered: string | null }[] = [];
        const observer = new window.ResizeObserver(() =>
          records.push({
            measured: list.style.getPropertyValue("--tab-list-free-space"),
            rendered: label.textContent
          })
        );
        observer.observe(list);
        await nextFrame();
        records.length = 0;

        // Wide enough for the tabs, and then too narrow for them
        for (const width of [608, 208]) {
          workspace.style.width = `${width}px`;
          await nextFrame();
          await nextFrame();
        }
        observer.disconnect();

        return records;
      });

    expect(records.length).toBeGreaterThanOrEqual(2);
    for (const { measured, rendered } of records) {
      expect(`${rendered}px`).toBe(measured);
    }

    // Once the tabs overflow, it's negative: the amount they overflow by
    const overflow = await tabList.evaluate(
      (list) => list.scrollWidth - list.getBoundingClientRect().width
    );
    expect(overflow).toBeGreaterThan(0);
    await expect(freeSpace).toHaveText(String(-Math.round(overflow)));
  });

  test("measures the free space again when a toolbar responds to it, without ResizeObserver errors", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Workspace
        defaultModel={createModel()}
        renderTabContent={() => null}
        // A test-only prop (see the test app's Workspace)
        {...({ showTabListFreeSpace: "responsive" } as object)}
      />
    );
    await expect(page.getByTestId("free-space-left")).not.toHaveText(
      "undefined"
    );

    // The toolbar shrinks when there's little free space, which changes the free space again (in the same frame);
    // this guards against regressions in that path (it passes with the list observed directly too, so it doesn't reproduce a known bug)
    const errors = await page
      .locator("[data-workspace]")
      .evaluate(async (workspace: HTMLElement) => {
        const window = workspace.ownerDocument.defaultView!;
        const errors: string[] = [];
        const onError = (event: ErrorEvent) => errors.push(event.message);
        window.addEventListener("error", onError);

        const nextFrame = () =>
          new Promise((resolve) => window.requestAnimationFrame(resolve));
        for (let width = 808; width >= 208; width -= 40) {
          workspace.style.width = `${width}px`;
          await nextFrame();
        }
        for (let width = 208; width <= 808; width += 40) {
          workspace.style.width = `${width}px`;
          await nextFrame();
        }
        workspace.style.width = "208px";
        await nextFrame();
        await nextFrame();

        window.removeEventListener("error", onError);
        return errors;
      });
    expect(errors).toEqual([]);

    // The toolbar's value matches the tab list's layout after it shrank
    const tabList = getTabset(page, "left").locator("[data-tab-list]");
    const overflow = await tabList.evaluate(
      (list) => list.scrollWidth - list.getBoundingClientRect().width
    );
    await expect(page.getByTestId("free-space-left")).toHaveText(
      String(-Math.round(overflow))
    );
  });

  test.describe("model sizes that don't fit the workspace", () => {
    // Sizes as if saved from a wider workspace, in which "a" and "b" were at least their minimum widths
    function createSavedModel(): WorkspaceModel {
      return {
        root: {
          children: [
            {
              collapsible: true,
              id: "a",
              minWidth: "192px",
              size: 13.8,
              tabs: [{ data: null, id: "a" }],
              type: "tabset"
            },
            {
              collapsible: true,
              id: "b",
              minWidth: "288px",
              size: 14.95,
              tabs: [{ data: null, id: "b" }],
              type: "tabset"
            },
            {
              collapsible: true,
              id: "c",
              size: 71.25,
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

    test("grows tabsets to their minimum sizes (rather than collapsing them), and updates the model", async ({
      page: mainPage
    }) => {
      const page = await goToUrl(mainPage, workspace(createSavedModel()));

      const a = getTabset(page, "a");
      const b = getTabset(page, "b");
      await expect(a).not.toHaveAttribute("data-tabset-collapsed");
      await expect(b).not.toHaveAttribute("data-tabset-collapsed");
      expect(Math.round((await a.boundingBox())!.width)).toBe(192);
      expect(Math.round((await b.boundingBox())!.width)).toBe(288);

      const change = await getLastChange(page);
      expect(change.meta).toEqual({
        isUserInteraction: false,
        reason: "resize"
      });

      // The model's sizes match the layout
      const workspaceWidth = 808 - SEPARATOR_SIZE * 2;
      const [modelA, modelB] = (change.model.root as SplitNode).children;
      expect(((modelA.size as number) * workspaceWidth) / 100).toBeCloseTo(
        192,
        0
      );
      expect(((modelB.size as number) * workspaceWidth) / 100).toBeCloseTo(
        288,
        0
      );
    });

    test("reports changes to several splits' layouts as one change", async ({
      page: mainPage
    }) => {
      // Two rows, each saved with sizes below its tabsets' minimums
      const row = (id: string): SplitNode => ({
        children: [
          {
            id: `${id}-a`,
            minWidth: "300px",
            size: 20,
            tabs: [],
            keepWhenEmpty: true,
            type: "tabset"
          },
          {
            id: `${id}-b`,
            size: 80,
            tabs: [],
            keepWhenEmpty: true,
            type: "tabset"
          }
        ],
        id,
        orientation: "horizontal",
        type: "split"
      });
      const page = await goToUrl(
        mainPage,
        workspace({
          root: {
            children: [row("top"), row("bottom")],
            id: "root",
            orientation: "vertical",
            type: "split"
          },
          version: 1
        })
      );

      await expect
        .poll(async () =>
          Math.round((await getTabset(page, "bottom-a").boundingBox())!.width)
        )
        .toBe(300);
      expect(
        Math.round((await getTabset(page, "top-a").boundingBox())!.width)
      ).toBe(300);

      const changes = JSON.parse(
        (await page.getByTestId("workspace-changes").textContent()) ?? "[]"
      );
      expect(changes).toHaveLength(1);
      expect(changes[0].meta).toEqual({
        isUserInteraction: false,
        reason: "resize"
      });
    });

    test("expands tabsets to at least their minimum sizes, without shrinking other tabsets below theirs", async ({
      page: mainPage
    }) => {
      // Like the saved model above, but "a" and "b" start collapsed; all three minimums fit in the workspace
      const page = await goToUrl(
        mainPage,
        workspace({
          root: {
            children: [
              {
                collapsed: true,
                collapsible: true,
                id: "a",
                minWidth: "205px",
                size: 15.48,
                tabs: [{ data: null, id: "a" }],
                type: "tabset"
              },
              {
                collapsed: true,
                collapsible: true,
                id: "b",
                minWidth: "282px",
                size: 29.33,
                tabs: [{ data: null, id: "b" }],
                type: "tabset"
              },
              {
                id: "c",
                minWidth: "205px",
                tabs: [{ data: null, id: "c" }],
                type: "tabset"
              }
            ],
            id: "root",
            orientation: "horizontal",
            type: "split"
          },
          version: 1
        })
      );

      const a = getTabset(page, "a");
      const b = getTabset(page, "b");
      await clickTab(page, getTab(page, "a"));
      await expect(a).not.toHaveAttribute("data-tabset-collapsed");
      await clickTab(page, getTab(page, "b"));
      await expect(b).not.toHaveAttribute("data-tabset-collapsed");

      // Neither "a" nor "c" is shrunk below its minimum (or collapsed) to make room for "b"
      await expect(a).not.toHaveAttribute("data-tabset-collapsed");
      expect(Math.round((await a.boundingBox())!.width)).toBeGreaterThanOrEqual(
        205
      );
      expect(Math.round((await b.boundingBox())!.width)).toBeGreaterThanOrEqual(
        282
      );
      expect(
        Math.round((await getTabset(page, "c").boundingBox())!.width)
      ).toBeGreaterThanOrEqual(205);

      // The model agrees with the layout
      const workspaceWidth = 808 - SEPARATOR_SIZE * 2;
      const { model } = await getLastChange(page);
      for (const child of (model.root as SplitNode).children) {
        expect((child as TabsetNode).collapsed).toBeUndefined();
        const width = (await getTabset(page, child.id!).boundingBox())!.width;
        expect(((child.size as number) * workspaceWidth) / 100).toBeCloseTo(
          width,
          0
        );
      }
    });

    test("updates the model when the workspace is too small for every tabset's minimum size", async ({
      page: mainPage
    }) => {
      const page = await goToUrl(
        mainPage,
        <Workspace
          defaultModel={createSavedModel()}
          renderTabContent={() => null}
          style={{ width: 408 }}
        />
      );

      // The Group collapses tabsets to make room; the model (and the tabsets' attributes, which come from it) agrees
      await expect
        .poll(async () => {
          const model = (await getLastChange(page))?.model;
          return (model?.root as SplitNode | undefined)?.children
            .filter((child) => (child as TabsetNode).collapsed)
            .map(({ id }) => id);
        })
        .not.toEqual([]);

      const model = (await getLastChange(page)).model as WorkspaceModel;
      for (const child of (model.root as SplitNode).children) {
        const tabset = getTabset(page, child.id!);
        if ((child as TabsetNode).collapsed) {
          await expect(tabset).toHaveAttribute("data-tabset-collapsed", "true");
        } else {
          await expect(tabset).not.toHaveAttribute("data-tabset-collapsed");
        }
      }
      expect((await getLastChange(page)).meta.isUserInteraction).toBe(false);
    });
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
