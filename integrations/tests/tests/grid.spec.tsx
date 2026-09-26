import { expect, test } from "@playwright/test";
import { Cell, Grid, Gridline, Group, Panel } from "react-resizable-panels";
import { calculateHitArea } from "../src/utils/calculateHitArea";
import { expectGridLayout } from "../src/utils/expectGridLayout";
import { getCenterCoordinates } from "../src/utils/getCenterCoordinates";
import { goToUrl } from "../src/utils/goToUrl";
import {
  drag,
  getBoundaryCenter,
  getCell,
  getCenter,
  getColumnGridline,
  getIntersectionCenter,
  getRowGridline
} from "../src/utils/grid";

// The test Grid is 808x408 with an 8px gap,
// so each axis of a 2x2 grid has 800x400 pixels available to its tracks:
// - 8px horizontally is 1% of the columns
// - 4px vertically is 1% of the rows
const EQUAL_LAYOUT = {
  columns: { "0": 50, "1": 50 },
  rows: { "0": 50, "1": 50 }
};

// Grids with gridlines are 16px larger in each direction to make room for the gridline (8px) and an additional gap (8px)
const GRID_WITH_GRIDLINES_STYLE = { height: 424, width: 824 };

// Note that the test serializer only supports library components (not custom components)
// so helpers like this one must be called as functions rather than rendered as elements
function twoByTwoGrid({
  spanBottomRow = false
}: {
  spanBottomRow?: boolean;
} = {}) {
  return (
    <Grid columns={2} rows={2}>
      <Cell column={0} id="top-left" row={0} />
      <Cell column={1} id="top-right" row={0} />
      <Cell
        column={0}
        columnSpan={spanBottomRow ? 2 : 1}
        id="bottom-left"
        row={1}
      />
      <Cell column={1} id="bottom-right" row={1} />
    </Grid>
  );
}

test.describe("Grid", () => {
  test("renders cells in a grid with an equal default layout", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, twoByTwoGrid());

    await expectGridLayout({
      layout: EQUAL_LAYOUT,
      mainPage,
      onLayoutChangedCount: 1
    });

    const topLeft = (await getCell(page, "top-left").boundingBox())!;
    const bottomRight = (await getCell(page, "bottom-right").boundingBox())!;
    expect(topLeft.width).toBe(400);
    expect(topLeft.height).toBe(200);
    expect(bottomRight.x - topLeft.x).toBe(408);
    expect(bottomRight.y - topLeft.y).toBe(208);
  });

  test("respects the default layout and track default sizes", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Grid
        columns={[{ id: "left" }, { id: "right" }]}
        defaultLayout={{ columns: { left: 25, right: 75 } }}
        rows={[{ defaultSize: 100, id: "top" }, { id: "bottom" }]}
      >
        <Cell column={0} id="top-left" row={0} />
        <Cell column={1} id="bottom-right" row={1} />
      </Grid>
    );

    await expectGridLayout({
      layout: {
        columns: { left: 25, right: 75 },
        rows: { top: 25, bottom: 75 }
      },
      mainPage
    });

    const topLeft = (await getCell(page, "top-left").boundingBox())!;
    expect(topLeft.width).toBe(200);
    expect(topLeft.height).toBe(100);
  });

  test("drag a column boundary to resize columns in every row", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, twoByTwoGrid());

    await drag(page, await getBoundaryCenter(page, ["top-left", "top-right"]), {
      x: 80
    });

    await expectGridLayout({
      layout: { columns: { "0": 60, "1": 40 }, rows: EQUAL_LAYOUT.rows },
      mainPage,
      onLayoutChangedCount: 2
    });

    // Tracks are shared, so the bottom row should be resized too
    const bottomLeft = (await getCell(page, "bottom-left").boundingBox())!;
    expect(bottomLeft.width).toBe(480);
  });

  test("drag a row boundary to resize rows in every column", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, twoByTwoGrid());

    await drag(
      page,
      await getBoundaryCenter(page, ["top-right", "bottom-right"]),
      { y: -40 }
    );

    await expectGridLayout({
      layout: { columns: EQUAL_LAYOUT.columns, rows: { "0": 40, "1": 60 } },
      mainPage,
      onLayoutChangedCount: 2
    });

    const topLeft = (await getCell(page, "top-left").boundingBox())!;
    expect(topLeft.height).toBe(160);
  });

  test("drag an intersection to resize columns and rows at once", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, twoByTwoGrid());

    const intersection = await getIntersectionCenter(
      page,
      "top-left",
      "bottom-right"
    );

    await page.mouse.move(intersection.x, intersection.y, { steps: 10 });
    expect(
      await page.evaluate(() => getComputedStyle(document.body).cursor)
    ).toBe("move");

    await drag(page, intersection, { x: 80, y: 40 });

    // The layout should only be committed once, even though both axes changed
    await expectGridLayout({
      layout: { columns: { "0": 60, "1": 40 }, rows: { "0": 60, "1": 40 } },
      mainPage,
      onLayoutChangedCount: 2
    });
  });

  test("boundaries cannot be resized alongside cells that span across them", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, twoByTwoGrid({ spanBottomRow: true }));

    const topBoundary = await getBoundaryCenter(page, [
      "top-left",
      "top-right"
    ]);
    const bottomLeft = (await getCell(page, "bottom-left").boundingBox())!;
    expect(bottomLeft.width).toBe(808);

    // The column boundary is covered by the spanning cell in the bottom row
    await drag(
      page,
      { x: topBoundary.x, y: bottomLeft.y + bottomLeft.height / 2 },
      { x: 80 }
    );

    await expectGridLayout({
      layout: EQUAL_LAYOUT,
      mainPage,
      onLayoutChangedCount: 1
    });

    // But it can still be resized alongside of the top row
    await drag(page, topBoundary, { x: 80 });

    await expectGridLayout({
      layout: { columns: { "0": 60, "1": 40 }, rows: EQUAL_LAYOUT.rows },
      mainPage,
      onLayoutChangedCount: 2
    });
  });

  test("respects track size constraints", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Grid
        columns={[{ minSize: 200 }, { minSize: "40%" }]}
        rows={[{ maxSize: "75%" }, { minSize: 40 }]}
      >
        <Cell column={0} id="top-left" row={0} />
        <Cell column={1} id="top-right" row={0} />
        <Cell column={0} id="bottom-left" row={1} />
        <Cell column={1} id="bottom-right" row={1} />
      </Grid>
    );

    await drag(
      page,
      await getIntersectionCenter(page, "top-left", "bottom-right"),
      { x: 1000, y: 1000 }
    );

    await expectGridLayout({
      layout: { columns: { "0": 60, "1": 40 }, rows: { "0": 75, "1": 25 } },
      mainPage
    });

    await drag(
      page,
      await getIntersectionCenter(page, "top-left", "bottom-right"),
      { x: -1000, y: 1000 }
    );

    // 200px of 800px is 25%
    await expectGridLayout({
      layout: { columns: { "0": 25, "1": 75 }, rows: { "0": 75, "1": 25 } },
      mainPage
    });
  });

  test("collapsible tracks", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Grid
        columns={[
          { collapsedSize: 40, collapsible: true, minSize: 160 },
          { id: "main" }
        ]}
        rows={1}
      >
        <Cell column={0} id="left" row={0} />
        <Cell column={1} id="right" row={0} />
      </Grid>
    );

    const boundary = await getBoundaryCenter(page, ["left", "right"]);

    // Dragging past the halfway point between the collapsed size and min size collapses the column
    await drag(page, boundary, { x: -1000 });

    await expectGridLayout({
      layout: { columns: { "0": 5, main: 95 }, rows: { "0": 100 } },
      mainPage
    });
    expect((await getCell(page, "left").boundingBox())!.width).toBe(40);
  });

  test("Groups can be nested within Cells", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Grid columns={2} rows={1}>
        <Cell column={0} id="cell-left" row={0} />
        <Cell column={1} id="cell-right" row={0}>
          <Group>
            <Panel id="left" />
            <Panel id="right" />
          </Group>
        </Cell>
      </Grid>
    );

    await expect(mainPage.getByText('"left": 50')).toBeVisible();

    // Resizing the nested Group should not resize the Grid
    const hitArea = await calculateHitArea(page, ["left", "right"]);
    await drag(page, getCenterCoordinates(hitArea), { x: 40 });

    await expect(mainPage.getByText('"left": 60')).toBeVisible();
    await expectGridLayout({
      layout: { columns: EQUAL_LAYOUT.columns, rows: { "0": 100 } },
      mainPage,
      onLayoutChangedCount: 1
    });

    // Resizing the Grid should not change the nested Group's layout
    await drag(
      page,
      await getBoundaryCenter(page, ["cell-left", "cell-right"]),
      { x: -80 }
    );

    await expectGridLayout({
      layout: { columns: { "0": 40, "1": 60 }, rows: { "0": 100 } },
      mainPage,
      onLayoutChangedCount: 2
    });
    await expect(mainPage.getByText('"left": 60')).toBeVisible();
  });
});

test.describe("Gridline", () => {
  function gridWithGridlines({
    columnGridlineDisabled
  }: {
    columnGridlineDisabled?: boolean;
  } = {}) {
    return (
      <Grid
        columns={[{ minSize: "10%" }, { minSize: "10%" }]}
        rows={[{ minSize: "10%" }, { minSize: "10%" }]}
        style={GRID_WITH_GRIDLINES_STYLE}
      >
        <Cell column={0} id="top-left" row={0} />
        <Cell column={1} id="top-right" row={0} />
        <Cell column={0} id="bottom-left" row={1} />
        <Cell column={1} id="bottom-right" row={1} />
        <Gridline type="column" column={1} disabled={columnGridlineDisabled} />
        <Gridline type="row" row={1} />
      </Grid>
    );
  }

  test("are rendered between tracks and span the full grid", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, gridWithGridlines());

    await expectGridLayout({ layout: EQUAL_LAYOUT, mainPage });

    const topLeft = (await getCell(page, "top-left").boundingBox())!;
    const topRight = (await getCell(page, "top-right").boundingBox())!;
    const columnGridline = (await getColumnGridline(page).boundingBox())!;
    const rowGridline = (await getRowGridline(page).boundingBox())!;

    // Gridlines take up space, so cells are the same size as in a Grid without them
    expect(topLeft.width).toBe(400);
    expect(topLeft.height).toBe(200);

    // Gridlines are centered within the gap between cells
    expect(columnGridline.x).toBe(topLeft.x + topLeft.width + 8);
    expect(columnGridline.width).toBe(8);
    expect(columnGridline.x + columnGridline.width + 8).toBe(topRight.x);
    expect(columnGridline.height).toBe(424);

    expect(rowGridline.y).toBe(topLeft.y + topLeft.height + 8);
    expect(rowGridline.height).toBe(8);
    expect(rowGridline.width).toBe(824);
  });

  // 2x2 grid with a cell spanning both columns in the bottom row;
  // the column gridline is only rendered alongside of the top row
  function gridWithSpanningCell() {
    return (
      <Grid columns={2} rows={2} style={GRID_WITH_GRIDLINES_STYLE}>
        <Cell column={0} id="top-left" row={0} />
        <Cell column={1} id="top-right" row={0} />
        <Cell column={0} columnSpan={2} id="spanning" row={1} />
        <Gridline type="column" column={1} row={0} rowSpan={1} />
        <Gridline type="row" row={1} />
      </Grid>
    );
  }

  test("can be rendered alongside a subset of tracks", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, gridWithSpanningCell());

    await expectGridLayout({ layout: EQUAL_LAYOUT, mainPage });

    const topLeft = (await getCell(page, "top-left").boundingBox())!;
    const spanning = (await getCell(page, "spanning").boundingBox())!;
    const columnGridline = (await getColumnGridline(page).boundingBox())!;
    const rowGridline = (await getRowGridline(page).boundingBox())!;

    // The column gridline spans the top row, plus the row gutter (so that it meets the row gridline)
    expect(columnGridline.y).toBe(topLeft.y);
    expect(columnGridline.y + columnGridline.height).toBe(
      rowGridline.y + rowGridline.height
    );

    // But it does not overlap the spanning cell
    expect(columnGridline.y + columnGridline.height).toBeLessThan(spanning.y);
  });

  test("resize tracks alongside of the tracks they span", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(mainPage, gridWithSpanningCell());

    const columnGridline = await getCenter(getColumnGridline(page));
    const spanning = await getCenter(getCell(page, "spanning"));
    const topLeft = await getCenter(getCell(page, "top-left"));

    // There is no gridline alongside of the spanning cell
    await drag(page, { x: columnGridline.x, y: spanning.y }, { x: 80 });
    await expectGridLayout({
      layout: EQUAL_LAYOUT,
      mainPage,
      onLayoutChangedCount: 1
    });

    await drag(page, { x: columnGridline.x, y: topLeft.y }, { x: 80 });
    await expectGridLayout({
      layout: { columns: { "0": 60, "1": 40 }, rows: EQUAL_LAYOUT.rows },
      mainPage,
      onLayoutChangedCount: 2
    });

    // Where the column gridline meets the row gridline, both axes are resized
    const { x } = await getCenter(getColumnGridline(page));
    const { y } = await getCenter(getRowGridline(page));
    await drag(page, { x, y }, { x: -80, y: 40 });
    await expectGridLayout({
      layout: { columns: { "0": 50, "1": 50 }, rows: { "0": 60, "1": 40 } },
      mainPage,
      onLayoutChangedCount: 3
    });
  });

  test("multiple gridlines along the same boundary share state", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Grid columns={2} rows={3} style={GRID_WITH_GRIDLINES_STYLE}>
        <Cell column={0} id="top-left" row={0} />
        <Cell column={1} id="top-right" row={0} />
        <Cell column={0} columnSpan={2} id="spanning" row={1} />
        <Cell column={0} id="bottom-left" row={2} />
        <Cell column={1} id="bottom-right" row={2} />
        <Gridline type="column" column={1} row={0} rowSpan={1} />
        <Gridline type="column" column={1} row={2} />
      </Grid>
    );

    const [first, second] = await getColumnGridline(page).all();

    // Only the first gridline along the boundary is in the tab order
    await expect(first).toHaveAttribute("tabindex", "0");
    await expect(second).toHaveAttribute("tabindex", "-1");

    // Hovering (or dragging) one highlights both
    const firstCenter = await getCenter(first);
    await page.mouse.move(firstCenter.x, firstCenter.y, { steps: 5 });
    await expect(first).toHaveAttribute("data-separator", "hover");
    await expect(second).toHaveAttribute("data-separator", "hover");

    await page.mouse.down();
    await expect(first).toHaveAttribute("data-separator", "active");
    await expect(second).toHaveAttribute("data-separator", "active");

    await page.mouse.move(firstCenter.x + 80, firstCenter.y);
    await page.mouse.up();

    // Both gridlines move together (along with the cells in every row)
    await expectGridLayout({
      layout: { columns: { "0": 60, "1": 40 }, rows: expect.any(Object) },
      mainPage
    });
    const firstBox = (await first.boundingBox())!;
    const secondBox = (await second.boundingBox())!;
    expect(firstBox.x).toBe(secondBox.x);

    // Either gridline can be used with the keyboard
    await second.focus();
    await page.keyboard.press("ArrowLeft");
    await expectGridLayout({
      layout: { columns: { "0": 55, "1": 45 }, rows: expect.any(Object) },
      mainPage
    });
  });

  test("keyboard interactions", async ({ page: mainPage }) => {
    const page = await goToUrl(mainPage, gridWithGridlines());

    const columnGridline = getColumnGridline(page);
    const rowGridline = getRowGridline(page);

    await expect(columnGridline).toHaveAttribute(
      "aria-controls",
      "top-left bottom-left"
    );
    await expect(columnGridline).toHaveAttribute("aria-valuenow", "50");
    await expect(columnGridline).toHaveAttribute("aria-valuemin", "10");
    await expect(columnGridline).toHaveAttribute("aria-valuemax", "90");

    await columnGridline.focus();
    await page.keyboard.press("ArrowRight");

    await expectGridLayout({
      layout: { columns: { "0": 55, "1": 45 }, rows: EQUAL_LAYOUT.rows },
      mainPage,
      onLayoutChangedCount: 2
    });
    await expect(columnGridline).toHaveAttribute("aria-valuenow", "55");

    // Up/down are no-ops for column gridlines
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");

    await page.keyboard.press("End");
    await expectGridLayout({
      layout: { columns: { "0": 90, "1": 10 }, rows: EQUAL_LAYOUT.rows },
      mainPage,
      onLayoutChangedCount: 3
    });

    await rowGridline.focus();
    await page.keyboard.press("ArrowUp");

    await expectGridLayout({
      layout: { columns: { "0": 90, "1": 10 }, rows: { "0": 45, "1": 55 } },
      mainPage,
      onLayoutChangedCount: 4
    });
    await expect(rowGridline).toHaveAttribute("aria-valuenow", "45");

    // Left/right are no-ops for row gridlines
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");

    await page.keyboard.press("Home");
    await expectGridLayout({
      layout: { columns: { "0": 90, "1": 10 }, rows: { "0": 10, "1": 90 } },
      mainPage,
      onLayoutChangedCount: 5
    });
  });

  test("pointer interactions", async ({ page: mainPage }) => {
    const page = await goToUrl(mainPage, gridWithGridlines());

    const columnGridline = getColumnGridline(page);
    const rowGridline = getRowGridline(page);

    // Drag the column gridline (alongside of the top row)
    const columnGridlineBox = (await columnGridline.boundingBox())!;
    await drag(
      page,
      {
        x: columnGridlineBox.x + columnGridlineBox.width / 2,
        y: columnGridlineBox.y + 50
      },
      { x: 80 }
    );

    await expectGridLayout({
      layout: { columns: { "0": 60, "1": 40 }, rows: EQUAL_LAYOUT.rows },
      mainPage,
      onLayoutChangedCount: 2
    });

    // Drag the row gridline
    const rowGridlineBox = (await rowGridline.boundingBox())!;
    await drag(
      page,
      {
        x: rowGridlineBox.x + 50,
        y: rowGridlineBox.y + rowGridlineBox.height / 2
      },
      { y: 40 }
    );

    await expectGridLayout({
      layout: { columns: { "0": 60, "1": 40 }, rows: { "0": 60, "1": 40 } },
      mainPage,
      onLayoutChangedCount: 3
    });

    // Drag where the two gridlines intersect
    const { x } = await getCenter(columnGridline);
    const { y } = await getCenter(rowGridline);
    await drag(page, { x, y }, { x: -160, y: -80 });

    await expectGridLayout({
      layout: { columns: { "0": 40, "1": 60 }, rows: { "0": 40, "1": 60 } },
      mainPage,
      onLayoutChangedCount: 4
    });
  });

  test("disabled gridlines", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      gridWithGridlines({ columnGridlineDisabled: true })
    );

    const columnGridline = getColumnGridline(page);

    await expect(columnGridline).toHaveAttribute("aria-disabled", "true");
    await expect(columnGridline).toHaveAttribute("data-separator", "disabled");
    await expect(columnGridline).not.toHaveAttribute("tabindex");

    // Pointer interactions are ignored
    await drag(page, await getBoundaryCenter(page, ["top-left", "top-right"]), {
      x: 80
    });

    await expectGridLayout({
      layout: EQUAL_LAYOUT,
      mainPage,
      onLayoutChangedCount: 1
    });

    // The intersecting row gridline still resizes rows (but not columns)
    const { x } = await getCenter(columnGridline);
    const { y } = await getCenter(getRowGridline(page));
    await drag(page, { x, y }, { x: 80, y: 40 });

    await expectGridLayout({
      layout: { columns: EQUAL_LAYOUT.columns, rows: { "0": 60, "1": 40 } },
      mainPage,
      onLayoutChangedCount: 2
    });
  });
});
