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
              tabs: [{ data: null, id: "tab-a" }],
              type: "tabset"
            },
            {
              collapsible: true,
              id: "b",
              minWidth: "288px",
              size: 14.95,
              tabs: [{ data: null, id: "tab-b" }],
              type: "tabset"
            },
            {
              collapsible: true,
              id: "c",
              size: 71.25,
              tabs: [{ data: null, id: "tab-c" }],
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

    async function getChanges(page: Page) {
      return JSON.parse(
        (await page.getByTestId("workspace-changes").textContent()) ?? "[]"
      ) as { meta: { isUserInteraction: boolean; reason: string } }[];
    }

    async function getCollapsedIds(page: Page) {
      const ids: string[] = [];
      for (const id of ["a", "b", "c"]) {
        if (await getTabset(page, id).getAttribute("data-tabset-collapsed")) {
          ids.push(id);
        }
      }

      return ids;
    }

    async function getWidths(page: Page) {
      const widths: number[] = [];
      for (const id of ["a", "b", "c"]) {
        widths.push(
          Math.round((await getTabset(page, id).boundingBox())!.width)
        );
      }

      return widths;
    }

    async function setWorkspaceWidth(page: Page, width: number) {
      await page
        .locator("[data-workspace]")
        .evaluate((element: HTMLElement, width) => {
          element.style.width = `${width}px`;
        }, width);
    }

    test("shows tabsets at their minimum sizes (rather than collapsing them), without changing the model", async ({
      page: mainPage
    }) => {
      const page = await goToUrl(mainPage, workspace(createSavedModel()));

      await expect
        .poll(async () => (await getWidths(page)).slice(0, 2))
        .toEqual([192, 288]);
      expect(await getCollapsedIds(page)).toEqual([]);
      expect(await getChanges(page)).toEqual([]);
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
                tabs: [{ data: null, id: "tab-a" }],
                type: "tabset"
              },
              {
                collapsed: true,
                collapsible: true,
                id: "b",
                minWidth: "282px",
                size: 29.33,
                tabs: [{ data: null, id: "tab-b" }],
                type: "tabset"
              },
              {
                id: "c",
                minWidth: "205px",
                tabs: [{ data: null, id: "tab-c" }],
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

      await clickTab(page, getTab(page, "tab-a"));
      await expect(getTabset(page, "a")).not.toHaveAttribute(
        "data-tabset-collapsed"
      );
      await clickTab(page, getTab(page, "tab-b"));
      await expect(getTabset(page, "b")).not.toHaveAttribute(
        "data-tabset-collapsed"
      );

      // Neither "a" nor "c" is shrunk below its minimum (or collapsed) to make room for "b"
      expect(await getCollapsedIds(page)).toEqual([]);
      const [a, b, c] = await getWidths(page);
      expect(a).toBeGreaterThanOrEqual(205);
      expect(b).toBeGreaterThanOrEqual(282);
      expect(c).toBeGreaterThanOrEqual(205);

      // Only the expansions are reported
      expect((await getChanges(page)).map(({ meta }) => meta)).toEqual([
        { isUserInteraction: true, reason: "expand" },
        { isUserInteraction: true, reason: "expand" }
      ]);
    });

    test("shows tabsets collapsed to fit when the workspace is too small for their minimum sizes, without changing the model", async ({
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

      // The Group collapses tabsets to make room; they're shown collapsed (with their content hidden),
      // as wide as their headers' content (this app doesn't style vertical tab lists, so that's the width of the tab)
      await expect.poll(() => getCollapsedIds(page)).toEqual(["a", "b"]);
      for (const id of ["a", "b"]) {
        const tabset = getTabset(page, id);
        await expect(tabset.locator("[data-tab-panels]")).toBeHidden();
        await expect
          .poll(async () =>
            Math.abs(
              (await tabset.boundingBox())!.width -
                (await getTab(page, `tab-${id}`).boundingBox())!.width
            )
          )
          .toBeLessThanOrEqual(1);
      }
      expect(await getChanges(page)).toEqual([]);
    });

    test("shows a tabset that's collapsed to fit as previewed while its separator is dragged", async ({
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
      await expect.poll(() => getCollapsedIds(page)).toEqual(["a", "b"]);

      // Dragging the separator beside "a" opens it again (taking the space from "c"), before the pointer is released;
      // only to just past its minimum size, so that "c" isn't squeezed to its collapsed size too
      // (collapsed tabsets are as wide as their tabs, which depends on the platform's fonts)
      const separator = (await page
        .locator("[data-separator]")
        .first()
        .boundingBox())!;
      const aLeft = (await getTabset(page, "a").boundingBox())!.x;
      const y = separator.y + separator.height / 2;
      await page.mouse.move(separator.x + separator.width / 2, y);
      await page.mouse.down();
      await page.mouse.move(aLeft + 200 + separator.width / 2, y, {
        steps: 10
      });
      await expect(getTabset(page, "a")).not.toHaveAttribute(
        "data-tabset-collapsed"
      );

      // Releasing it saves the layout the user dragged to; "b" is still collapsed to fit, but the resize didn't collapse it,
      // so it stays expanded (with its size) in the model
      await page.mouse.up();
      expect(await getCollapsedIds(page)).toEqual(["b"]);
      await expect.poll(async () => (await getChanges(page)).length).toBe(1);
      const [change] = (await getChanges(page)) as unknown as {
        meta: { isUserInteraction: boolean; reason: string };
        model: WorkspaceModel;
      }[];
      expect(change.meta).toEqual({
        isUserInteraction: true,
        reason: "resize"
      });
      expect(
        (change.model.root as SplitNode).children.map(
          (child) => (child as TabsetNode).collapsed ?? false
        )
      ).toEqual([false, false, false]);

      // So it's shown expanded again once it fits
      await setWorkspaceWidth(page, 808);
      await expect.poll(() => getCollapsedIds(page)).toEqual([]);
      expect(await getChanges(page)).toHaveLength(1);
    });

    test("shows tabsets as the model has them as the workspace is made wider, after their minimum sizes were applied", async ({
      page: mainPage
    }) => {
      // Not collapsible, so only minimum sizes are applied (see the next test for collapsible tabsets)
      const model = createSavedModel();
      for (const child of (model.root as SplitNode).children) {
        delete (child as TabsetNode).collapsible;
      }
      const page = await goToUrl(mainPage, workspace(model));
      await expect
        .poll(async () => (await getWidths(page)).slice(0, 2))
        .toEqual([192, 288]);

      // At 1600px, "b" is still held at its minimum size, and "a" and "c" share the rest in proportion to their sizes
      // (1600px, less two 8px separators and "b", is 1296px; "a" is 13.8 / (13.8 + 71.25) of that)
      await setWorkspaceWidth(page, 1600);
      await expect
        .poll(async () => {
          const [a, b, c] = await getWidths(page);
          return (
            Math.abs(a - 210) <= 1 &&
            Math.abs(b - 288) <= 1 &&
            Math.abs(c - 1086) <= 1
          );
        })
        .toBe(true);
      expect(await getChanges(page)).toEqual([]);
    });

    test("reports tabsets that are collapsed to fit to useParentTabsetState", async ({
      page: mainPage
    }) => {
      const page = await goToUrl(
        mainPage,
        <Workspace
          defaultModel={createSavedModel()}
          renderTabContent={() => null}
          style={{ width: 408 }}
          // A test-only prop (see the test app's Workspace)
          {...({ showTabsetState: true } as object)}
        />
      );

      await expect.poll(() => getCollapsedIds(page)).toEqual(["a", "b"]);
      for (const id of ["a", "b"]) {
        const state = page.getByTestId(`tabset-state-${id}`);
        await expect(state).toHaveAttribute("data-collapsed", "true");
        await expect(state).toHaveAttribute("data-collapsed-to-fit", "true");
      }
      await expect(page.getByTestId("tabset-state-c")).toHaveAttribute(
        "data-collapsed-to-fit",
        "false"
      );

      // Clicking a tab only selects it (the tabset can't be expanded until it fits)
      await clickTab(page, getTab(page, "tab-a"));
      expect(await getCollapsedIds(page)).toEqual(["a", "b"]);
      expect(
        (await getChanges(page)).filter(({ meta }) => meta.reason === "expand")
      ).toEqual([]);
    });

    test("doesn't show a tabset collapsed to fit once it's no longer in a split", async ({
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
      await expect.poll(() => getCollapsedIds(page)).toEqual(["a", "b"]);

      // Closing the other tabsets' tabs leaves "b" as the only tabset (the root), which fills the workspace
      // (a collapsed tab has no close button, so "a" is closed from the keyboard)
      await getTab(page, "tab-c").getByRole("button").click();
      await getTab(page, "tab-a").focus();
      await page.keyboard.press("Delete");
      await expect(getTabset(page, "a")).toHaveCount(0);
      await expect(getTabset(page, "c")).toHaveCount(0);

      await expect(getTabset(page, "b")).not.toHaveAttribute(
        "data-tabset-collapsed"
      );
      await expect(
        getTabset(page, "b").locator("[data-tab-panels]")
      ).toBeVisible();
    });

    test("shows tabsets as the model has them again once they fit", async ({
      page: mainPage
    }) => {
      const page = await goToUrl(mainPage, workspace(createSavedModel()));
      await expect
        .poll(async () => (await getWidths(page)).slice(0, 2))
        .toEqual([192, 288]);
      const initialWidths = await getWidths(page);

      // Made narrower one step at a time (like a window being resized), until the tabsets don't fit
      for (const width of [700, 600, 500, 408]) {
        await setWorkspaceWidth(page, width);
        await page.waitForTimeout(50);
      }
      await expect.poll(() => getCollapsedIds(page)).not.toEqual([]);

      for (const width of [500, 600, 700, 808]) {
        await setWorkspaceWidth(page, width);
        await page.waitForTimeout(50);
      }
      await expect.poll(() => getCollapsedIds(page)).toEqual([]);
      // (within a pixel, since sizes are rounded to percentages)
      const widths = await getWidths(page);
      widths.forEach((width, index) =>
        expect(Math.abs(width - initialWidths[index])).toBeLessThanOrEqual(1)
      );
      expect(await getChanges(page)).toEqual([]);
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
