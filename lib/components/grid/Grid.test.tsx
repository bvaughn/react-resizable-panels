import { act, fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Group } from "../group/Group";
import { Panel } from "../panel/Panel";
import { Cell } from "./Cell";
import { Grid } from "./Grid";
import { Gridline } from "./Gridline";
import type { GridImperativeHandle, GridLayout, GridTrackProps } from "./types";

// Lays out a Grid (of the specified size) at the origin using the Grid's current layout,
// with cells positioned according to their row/column placement
// (jsdom does not support CSS Grid layout)
function mockGridLayout({
  gridRef,
  height = 100,
  gridlineSize = 0,
  width = 100
}: {
  gridRef: { current: GridImperativeHandle | null };
  height?: number;
  gridlineSize?: number;
  width?: number;
}) {
  const getOffsets = (
    layout: { [id: string]: number },
    size: number,
    trackCount: number
  ) => {
    const available = size - gridlineSize * (trackCount - 1);
    const offsets: number[] = [];
    let offset = 0;
    for (let index = 0; index < trackCount; index++) {
      offsets.push(offset);
      const percentage = layout[`${index}`] ?? 100 / trackCount;
      offset += (percentage / 100) * available + gridlineSize;
    }
    offsets.push(size + gridlineSize);
    return offsets;
  };

  setElementBoundsFunction((element) => {
    if (element.hasAttribute("data-grid")) {
      return new DOMRect(0, 0, width, height);
    }

    const layout = gridRef.current?.getLayout();
    const grid = element.closest("[data-grid]");
    if (!layout || !grid) {
      return;
    }

    const columnCount = Math.max(1, Object.keys(layout.columns).length);
    const rowCount = Math.max(1, Object.keys(layout.rows).length);
    const columns = getOffsets(layout.columns, width, columnCount);
    const rows = getOffsets(layout.rows, height, rowCount);

    if (element.hasAttribute("data-cell")) {
      const column = parseInt(element.getAttribute("data-column")!);
      const row = parseInt(element.getAttribute("data-row")!);
      const columnSpan = parseInt(element.getAttribute("data-column-span")!);
      const rowSpan = parseInt(element.getAttribute("data-row-span")!);

      const left = columns[column];
      const top = rows[row];
      const right = columns[column + columnSpan] - gridlineSize;
      const bottom = rows[row + rowSpan] - gridlineSize;

      return new DOMRect(left, top, right - left, bottom - top);
    } else if (element.hasAttribute("data-separator")) {
      const orientation = element.getAttribute("aria-orientation");
      const [placement, crossPlacement] =
        orientation === "vertical"
          ? [element.style.gridColumn, element.style.gridRow]
          : [element.style.gridRow, element.style.gridColumn];
      const index = parseInt(placement) / 2;

      // Convert CSS grid lines (along the cross axis) to pixels;
      // gutter tracks are assumed to be present when gridlines have a size
      const crossOffsets = orientation === "vertical" ? rows : columns;
      const crossSize = orientation === "vertical" ? height : width;
      const lineToPixel = (line: string) => {
        const value = parseInt(line);
        if (value === -1) {
          return crossSize;
        } else if (gridlineSize === 0) {
          return crossOffsets[value - 1];
        } else if (value % 2 === 1) {
          return crossOffsets[(value - 1) / 2];
        } else {
          return crossOffsets[value / 2] - gridlineSize;
        }
      };
      const [startLine, endLine] = crossPlacement.split("/");
      const crossStart = lineToPixel(startLine);
      const crossEnd = Math.min(crossSize, lineToPixel(endLine));

      if (orientation === "vertical") {
        const left = columns[index] - gridlineSize;
        return new DOMRect(
          left,
          crossStart,
          gridlineSize,
          crossEnd - crossStart
        );
      } else {
        const top = rows[index] - gridlineSize;
        return new DOMRect(
          crossStart,
          top,
          crossEnd - crossStart,
          gridlineSize
        );
      }
    }
  });
}

function TestCell({
  column,
  columnSpan = 1,
  row,
  rowSpan = 1
}: {
  column: number;
  columnSpan?: number;
  row: number;
  rowSpan?: number;
}) {
  return (
    <Cell
      column={column}
      columnSpan={columnSpan}
      data-column={column}
      data-column-span={columnSpan}
      data-row={row}
      data-row-span={rowSpan}
      id={`cell-${row}-${column}`}
      row={row}
      rowSpan={rowSpan}
    />
  );
}

async function drag(
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  await userEvent.pointer([
    { keys: "[MouseLeft>]", coords: { clientX: from.x, clientY: from.y } },
    { coords: { clientX: to.x, clientY: to.y } },
    { keys: "[/MouseLeft]", coords: { clientX: to.x, clientY: to.y } }
  ]);
}

function renderTwoByTwoGrid({
  columns = 2,
  onLayoutChange,
  onLayoutChanged,
  rows = 2,
  spanBottomRow = false
}: {
  columns?: number | GridTrackProps[];
  onLayoutChange?: (layout: GridLayout) => void;
  onLayoutChanged?: (
    layout: GridLayout,
    meta: { isUserInteraction: boolean }
  ) => void;
  rows?: number | GridTrackProps[];
  spanBottomRow?: boolean;
} = {}) {
  const gridRef = createRef<GridImperativeHandle>();

  mockGridLayout({ gridRef });

  const result = render(
    <Grid
      columns={columns}
      gridRef={gridRef}
      id="grid"
      onLayoutChange={onLayoutChange}
      onLayoutChanged={onLayoutChanged}
      rows={rows}
    >
      <TestCell row={0} column={0} />
      <TestCell row={0} column={1} />
      {spanBottomRow ? (
        <TestCell row={1} column={0} columnSpan={2} />
      ) : (
        <>
          <TestCell row={1} column={0} />
          <TestCell row={1} column={1} />
        </>
      )}
    </Grid>
  );

  return { ...result, gridRef };
}

describe("Grid", () => {
  test("renders cells using CSS grid placement", () => {
    const { getByTestId } = renderTwoByTwoGrid({ spanBottomRow: true });

    const grid = document.querySelector("[data-grid]") as HTMLElement;
    expect(grid.style.display).toBe("grid");
    expect(grid.style.gridTemplateColumns).toBe(
      "minmax(0, 50fr) minmax(0, 50fr)"
    );
    expect(grid.style.gridTemplateRows).toBe("minmax(0, 50fr) minmax(0, 50fr)");

    expect(getByTestId("cell-0-1").style.gridColumn).toBe("2 / span 1");
    expect(getByTestId("cell-0-1").style.gridRow).toBe("1 / span 1");
    expect(getByTestId("cell-1-0").style.gridColumn).toBe("1 / span 2");
    expect(getByTestId("cell-1-0").style.gridRow).toBe("2 / span 1");
  });

  test("assigns equal default sizes and notifies on mount", () => {
    const onLayoutChange = vi.fn();
    const onLayoutChanged = vi.fn();
    const { gridRef } = renderTwoByTwoGrid({
      columns: 3,
      onLayoutChange,
      onLayoutChanged
    });

    const layout = {
      columns: { "0": 33.334, "1": 33.333, "2": 33.333 },
      rows: { "0": 50, "1": 50 }
    };
    expect(gridRef.current!.getLayout()).toEqual(layout);
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    expect(onLayoutChange).toHaveBeenCalledWith(layout);
    expect(onLayoutChanged).toHaveBeenCalledTimes(1);
    expect(onLayoutChanged).toHaveBeenCalledWith(layout, {
      isUserInteraction: false
    });
  });

  test("respects track ids and the default layout", () => {
    const gridRef = createRef<GridImperativeHandle>();
    mockGridLayout({ gridRef });
    render(
      <Grid
        columns={[{ id: "left" }, { id: "right" }]}
        defaultLayout={{ columns: { right: 75, left: 25 } }}
        gridRef={gridRef}
        rows={[{ id: "top", defaultSize: "20%" }, { id: "bottom" }]}
      >
        <Cell row={0} column={0} />
      </Grid>
    );

    expect(gridRef.current!.getLayout()).toEqual({
      columns: { left: 25, right: 75 },
      rows: { top: 20, bottom: 80 }
    });

    const grid = document.querySelector("[data-grid]") as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe(
      "minmax(0, 25fr) minmax(0, 75fr)"
    );
  });

  test("resizes columns by dragging a column boundary", async () => {
    const onLayoutChanged = vi.fn();
    const { gridRef } = renderTwoByTwoGrid({ onLayoutChanged });
    onLayoutChanged.mockReset();

    await drag({ x: 50, y: 25 }, { x: 60, y: 25 });

    const layout = {
      columns: { "0": 60, "1": 40 },
      rows: { "0": 50, "1": 50 }
    };
    expect(gridRef.current!.getLayout()).toEqual(layout);
    expect(onLayoutChanged).toHaveBeenCalledTimes(1);
    expect(onLayoutChanged).toHaveBeenCalledWith(layout, {
      isUserInteraction: true
    });

    // Rows other than the one that was dragged should also be resized (tracks are shared)
    const grid = document.querySelector("[data-grid]") as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe(
      "minmax(0, 60fr) minmax(0, 40fr)"
    );
  });

  test("resizes rows by dragging a row boundary", async () => {
    const { gridRef } = renderTwoByTwoGrid();

    await drag({ x: 75, y: 50 }, { x: 75, y: 30 });

    expect(gridRef.current!.getLayout()).toEqual({
      columns: { "0": 50, "1": 50 },
      rows: { "0": 30, "1": 70 }
    });
  });

  test("resizes both axes by dragging an intersection", async () => {
    const onLayoutChange = vi.fn();
    const onLayoutChanged = vi.fn();
    const { gridRef } = renderTwoByTwoGrid({ onLayoutChange, onLayoutChanged });
    onLayoutChange.mockReset();
    onLayoutChanged.mockReset();

    await drag({ x: 50, y: 50 }, { x: 60, y: 70 });

    const layout = {
      columns: { "0": 60, "1": 40 },
      rows: { "0": 70, "1": 30 }
    };
    expect(gridRef.current!.getLayout()).toEqual(layout);
    expect(onLayoutChange).toHaveBeenLastCalledWith(layout);
    expect(onLayoutChanged).toHaveBeenCalledTimes(1);
    expect(onLayoutChanged).toHaveBeenCalledWith(layout, {
      isUserInteraction: true
    });
  });

  test("does not resize a boundary alongside of a cell that spans across it", async () => {
    const { gridRef } = renderTwoByTwoGrid({ spanBottomRow: true });

    // The column boundary is covered by the spanning cell in the bottom row
    await drag({ x: 50, y: 75 }, { x: 60, y: 75 });
    expect(gridRef.current!.getLayout().columns).toEqual({ "0": 50, "1": 50 });

    // But can still be resized alongside of the top row
    await drag({ x: 50, y: 25 }, { x: 60, y: 25 });
    expect(gridRef.current!.getLayout().columns).toEqual({ "0": 60, "1": 40 });

    // The row boundary is still resizable across the full width
    await drag({ x: 90, y: 50 }, { x: 90, y: 40 });
    expect(gridRef.current!.getLayout().rows).toEqual({ "0": 40, "1": 60 });
  });

  test("resizes boundaries that are split into multiple segments by spanning cells", async () => {
    const gridRef = createRef<GridImperativeHandle>();
    mockGridLayout({ gridRef, height: 90 });
    render(
      <Grid columns={2} gridRef={gridRef} rows={3}>
        <TestCell row={0} column={0} />
        <TestCell row={0} column={1} />
        <TestCell row={1} column={0} columnSpan={2} />
        <TestCell row={2} column={0} />
        <TestCell row={2} column={1} />
      </Grid>
    );

    // Top segment
    await drag({ x: 50, y: 15 }, { x: 60, y: 15 });
    expect(gridRef.current!.getLayout().columns).toEqual({ "0": 60, "1": 40 });

    // Middle (spanning) row
    await drag({ x: 60, y: 45 }, { x: 70, y: 45 });
    expect(gridRef.current!.getLayout().columns).toEqual({ "0": 60, "1": 40 });

    // Bottom segment
    await drag({ x: 60, y: 75 }, { x: 40, y: 75 });
    expect(gridRef.current!.getLayout().columns).toEqual({ "0": 40, "1": 60 });
  });

  test.each(["column", "row"] as const)(
    "small implicit %s targets do not expand into spanning cells",
    async (axis) => {
      const gridRef = createRef<GridImperativeHandle>();
      mockGridLayout({ gridRef });
      const column = axis === "column";
      render(
        <Grid
          gridRef={gridRef}
          columns={column ? 2 : [{ defaultSize: "5%" }, {}]}
          rows={column ? [{ defaultSize: "5%" }, {}] : 2}
        >
          <TestCell column={0} row={0} />
          <TestCell column={column ? 1 : 0} row={column ? 0 : 1} />
          <TestCell
            column={column ? 0 : 1}
            row={column ? 1 : 0}
            columnSpan={column ? 2 : 1}
            rowSpan={column ? 1 : 2}
          />
        </Grid>
      );
      const key = column ? "columns" : "rows";
      await drag(
        column ? { x: 50, y: 6 } : { x: 6, y: 50 },
        column ? { x: 60, y: 6 } : { x: 6, y: 60 }
      );
      expect(gridRef.current!.getLayout()[key]).toEqual({ "0": 50, "1": 50 });
      // The portion of the target beside the small, non-spanning cells still works.
      await drag(
        column ? { x: 50, y: 2 } : { x: 2, y: 50 },
        column ? { x: 60, y: 2 } : { x: 2, y: 60 }
      );
      expect(gridRef.current!.getLayout()[key]).toEqual({ "0": 60, "1": 40 });
    }
  );

  test("respects track constraints", async () => {
    const { gridRef } = renderTwoByTwoGrid({
      columns: [{ minSize: 20 }, { minSize: "40%" }],
      rows: [{ maxSize: "60%" }, {}]
    });

    await drag({ x: 50, y: 50 }, { x: 90, y: 90 });
    expect(gridRef.current!.getLayout()).toEqual({
      columns: { "0": 60, "1": 40 },
      rows: { "0": 60, "1": 40 }
    });

    await drag({ x: 60, y: 60 }, { x: 0, y: 60 });
    expect(gridRef.current!.getLayout().columns).toEqual({
      "0": 20,
      "1": 80
    });
  });

  test("does not resize when disabled", async () => {
    const gridRef = createRef<GridImperativeHandle>();
    mockGridLayout({ gridRef });
    render(
      <Grid columns={2} disabled gridRef={gridRef} rows={2}>
        <TestCell row={0} column={0} />
        <TestCell row={0} column={1} />
        <TestCell row={1} column={0} />
        <TestCell row={1} column={1} />
      </Grid>
    );

    await drag({ x: 50, y: 50 }, { x: 60, y: 60 });
    expect(gridRef.current!.getLayout()).toEqual({
      columns: { "0": 50, "1": 50 },
      rows: { "0": 50, "1": 50 }
    });
  });

  test("does not resize disabled tracks", async () => {
    const { gridRef } = renderTwoByTwoGrid({
      columns: [{ disabled: true }, {}]
    });

    await drag({ x: 50, y: 50 }, { x: 60, y: 60 });
    expect(gridRef.current!.getLayout()).toEqual({
      columns: { "0": 50, "1": 50 },
      rows: { "0": 60, "1": 40 }
    });
  });

  describe("imperative API", () => {
    test("getLayout and setLayout", () => {
      const onLayoutChanged = vi.fn();
      const { gridRef } = renderTwoByTwoGrid({ onLayoutChanged });
      onLayoutChanged.mockReset();

      act(() => {
        expect(
          gridRef.current!.setLayout({ columns: { "0": 30, "1": 70 } })
        ).toEqual({
          columns: { "0": 30, "1": 70 },
          rows: { "0": 50, "1": 50 }
        });
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith(
        {
          columns: { "0": 30, "1": 70 },
          rows: { "0": 50, "1": 50 }
        },
        { isUserInteraction: false }
      );

      const grid = document.querySelector("[data-grid]") as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe(
        "minmax(0, 30fr) minmax(0, 70fr)"
      );
    });

    test("track methods", () => {
      const { gridRef } = renderTwoByTwoGrid({
        rows: [{}, { collapsible: true, collapsedSize: 10, minSize: 30 }]
      });

      const row = gridRef.current!.getTrackByIndex("row", 1);
      expect(row.getSize()).toEqual({ asPercentage: 50, inPixels: 50 });
      expect(row.isCollapsed()).toBe(false);

      act(() => row.collapse());
      expect(row.isCollapsed()).toBe(true);
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 90, "1": 10 });

      act(() => row.expand());
      expect(row.isCollapsed()).toBe(false);
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 50, "1": 50 });

      const column = gridRef.current!.getTrackById("column", "0");
      act(() => column.resize("25px"));
      expect(gridRef.current!.getLayout().columns).toEqual({
        "0": 25,
        "1": 75
      });
      expect(column.getSize()).toEqual({ asPercentage: 25, inPixels: 25 });
    });

    test("getTrackById and getTrackByIndex", () => {
      const { gridRef } = renderTwoByTwoGrid({
        columns: [{ id: "left" }, { id: "right" }]
      });

      act(() => gridRef.current!.getTrackById("column", "right").resize("25"));
      expect(gridRef.current!.getLayout().columns).toEqual({
        left: 75,
        right: 25
      });

      // Indices are not ids
      expect(
        gridRef.current!.getTrackByIndex("column", 0).getSize().asPercentage
      ).toBe(75);
      expect(() => gridRef.current!.getTrackById("column", 0)).toThrow(
        'Grid "grid" does not contain a column with id "0"; column ids are "left", "right"'
      );

      // Tracks without explicit ids use their index as their id
      expect(
        gridRef.current!.getTrackById("row", 1).getSize().asPercentage
      ).toBe(50);
    });

    test("track methods throw helpful errors for missing tracks", () => {
      const { gridRef, rerender } = renderTwoByTwoGrid();

      expect(() => gridRef.current!.getTrackById("row", "2")).toThrow(
        'Grid "grid" does not contain a row with id "2"; row ids are "0", "1"'
      );
      expect(() => gridRef.current!.getTrackByIndex("column", 2)).toThrow(
        'Grid "grid" does not contain a column at index 2; it has 2 columns'
      );
      expect(() => gridRef.current!.getTrackByIndex("column", -1)).toThrow(
        'Grid "grid" does not contain a column at index -1; it has 2 columns'
      );

      // Tracks that are removed after their API was retrieved
      const column = gridRef.current!.getTrackByIndex("column", 1);
      rerender(
        <Grid columns={1} gridRef={gridRef} id="grid" rows={2}>
          <TestCell row={0} column={0} />
          <TestCell row={1} column={0} />
        </Grid>
      );
      expect(() => column.getSize()).toThrow(
        'Grid "grid" no longer contains a column with id "1"; column ids are "0"'
      );
    });
  });

  describe("Gridline", () => {
    function renderGridWithGridlines({
      columnGridlineDisabled,
      rowGridlineDisabled
    }: {
      columnGridlineDisabled?: boolean;
      rowGridlineDisabled?: boolean;
    } = {}) {
      const gridRef = createRef<GridImperativeHandle>();
      const columnGridlineRef = createRef<HTMLDivElement>();
      const rowGridlineRef = createRef<HTMLDivElement>();
      mockGridLayout({ gridRef, height: 110, gridlineSize: 10, width: 110 });

      const result = render(
        <Grid
          columns={2}
          gridRef={gridRef}
          rows={[{}, { collapsible: true, minSize: 20 }]}
        >
          <TestCell row={0} column={0} />
          <TestCell row={0} column={1} />
          <Gridline
            type="column"
            column={1}
            disabled={columnGridlineDisabled}
            elementRef={columnGridlineRef}
          />
          <Gridline
            type="row"
            disabled={rowGridlineDisabled}
            elementRef={rowGridlineRef}
            row={1}
          />
          <TestCell row={1} column={0} />
          <TestCell row={1} column={1} />
        </Grid>
      );

      return {
        ...result,
        getColumnGridline: () => columnGridlineRef.current!,
        getRowGridline: () => rowGridlineRef.current!,
        gridRef
      };
    }

    test("places gridlines within gutter tracks", () => {
      const { getByTestId, getColumnGridline, getRowGridline } =
        renderGridWithGridlines();

      const grid = document.querySelector("[data-grid]") as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe(
        "minmax(0, 50fr) auto minmax(0, 50fr)"
      );
      expect(grid.style.gridTemplateRows).toBe(
        "minmax(0, 50fr) auto minmax(0, 50fr)"
      );

      expect(getByTestId("cell-1-1").style.gridColumn).toBe("3 / span 1");
      expect(getByTestId("cell-1-1").style.gridRow).toBe("3 / span 1");

      expect(getColumnGridline().style.gridColumn).toBe("2 / span 1");
      expect(getColumnGridline().style.gridRow).toBe("1 / -1");

      expect(getRowGridline().style.gridColumn).toBe("1 / -1");
      expect(getRowGridline().style.gridRow).toBe("2 / span 1");
    });

    test("places gridlines between later tracks", () => {
      const columnGridlineRef = createRef<HTMLDivElement>();
      const rowGridlineRef = createRef<HTMLDivElement>();
      render(
        <Grid columns={3} rows={3}>
          <Gridline type="column" column={2} elementRef={columnGridlineRef} />
          <Gridline type="row" elementRef={rowGridlineRef} row={2} />
        </Grid>
      );

      expect(columnGridlineRef.current!.style.gridColumn).toBe("4 / span 1");
      expect(columnGridlineRef.current!.style.gridRow).toBe("1 / -1");
      expect(rowGridlineRef.current!.style.gridColumn).toBe("1 / -1");
      expect(rowGridlineRef.current!.style.gridRow).toBe("4 / span 1");
    });

    test("renders children, className, and style", () => {
      const elementRef = createRef<HTMLDivElement>();
      render(
        <Grid columns={2} rows={1}>
          <Gridline
            type="column"
            className="custom-class"
            column={1}
            elementRef={elementRef}
            style={{ backgroundColor: "red", gridColumn: "1 / 2" }}
          >
            <span>handle</span>
          </Gridline>
        </Grid>
      );

      const element = elementRef.current!;
      expect(element).toHaveTextContent("handle");
      expect(element).toHaveClass("custom-class");
      expect(element.style.backgroundColor).toBe("red");

      // Grid placement cannot be overridden
      expect(element.style.gridColumn).toBe("2 / span 1");
    });

    test("sets aria attributes", () => {
      const { getColumnGridline, getRowGridline } = renderGridWithGridlines();

      const columnGridline = getColumnGridline();
      expect(columnGridline).toHaveAttribute("role", "separator");
      expect(columnGridline).toHaveAttribute("aria-orientation", "vertical");
      expect(columnGridline).toHaveAttribute(
        "aria-controls",
        "cell-0-0 cell-1-0"
      );
      expect(columnGridline).toHaveAttribute("aria-valuenow", "50");
      expect(columnGridline).toHaveAttribute("aria-valuemin", "0");
      expect(columnGridline).toHaveAttribute("aria-valuemax", "100");

      const rowGridline = getRowGridline();
      expect(rowGridline).toHaveAttribute("aria-orientation", "horizontal");
      expect(rowGridline).toHaveAttribute("aria-controls", "cell-0-0 cell-0-1");
      for (const gridline of [columnGridline, rowGridline]) {
        for (const id of gridline.getAttribute("aria-controls")!.split(" ")) {
          expect(document.getElementById(id)).toHaveAttribute("data-cell");
        }
      }
      // The bottom row is collapsible, so the top row can grow to 100%
      expect(rowGridline).toHaveAttribute("aria-valuemax", "100");
    });

    test("updates controlled cells when cells change, including generated ids and spans", () => {
      const gridlineRef = createRef<HTMLDivElement>();
      const cellRef = createRef<HTMLDivElement>();
      // The gridline sits between the center and right columns (so it controls cells in the center column)
      const renderGrid = (showCell: boolean, columnSpan = 1) => (
        <Grid
          columns={[{ id: "left" }, { id: "center" }, { id: "right" }]}
          rows={1}
        >
          {showCell && (
            <Cell
              column={0}
              row={0}
              columnSpan={columnSpan}
              elementRef={cellRef}
            />
          )}
          <Gridline type="column" column={2} elementRef={gridlineRef} />
        </Grid>
      );
      const { rerender } = render(renderGrid(true));
      expect(gridlineRef.current).not.toHaveAttribute("aria-controls");
      rerender(renderGrid(true, 2));
      expect(gridlineRef.current).toHaveAttribute(
        "aria-controls",
        cellRef.current!.id
      );
      expect(document.getElementById(cellRef.current!.id)).toBe(
        cellRef.current
      );
      rerender(renderGrid(false));
      expect(gridlineRef.current).not.toHaveAttribute("aria-controls");
    });

    describe("gridlines alongside a subset of tracks", () => {
      // 2x2 grid (110x110, 10px gridlines) with a cell spanning both columns in the bottom row;
      // the column gridline is only rendered alongside of the top row
      function renderGridWithSpanningCell({
        firstColumnGridlineDisabled
      }: { firstColumnGridlineDisabled?: boolean } = {}) {
        const gridRef = createRef<GridImperativeHandle>();
        const columnGridlineRef = createRef<HTMLDivElement>();
        const rowGridlineRef = createRef<HTMLDivElement>();
        mockGridLayout({ gridRef, height: 110, gridlineSize: 10, width: 110 });

        const result = render(
          <Grid columns={2} gridRef={gridRef} rows={2}>
            <TestCell row={0} column={0} />
            <TestCell row={0} column={1} />
            <TestCell row={1} column={0} columnSpan={2} />
            <Gridline
              type="column"
              column={1}
              disabled={firstColumnGridlineDisabled}
              elementRef={columnGridlineRef}
              row={0}
              rowSpan={1}
            />
            <Gridline type="row" elementRef={rowGridlineRef} row={1} />
          </Grid>
        );

        return {
          ...result,
          getColumnGridline: () => columnGridlineRef.current!,
          getRowGridline: () => rowGridlineRef.current!,
          gridRef
        };
      }

      test("extend into the adjacent gutter (but not the edge of the grid)", () => {
        const { getColumnGridline } = renderGridWithSpanningCell();

        expect(getColumnGridline().style.gridColumn).toBe("2 / span 1");
        expect(getColumnGridline().style.gridRow).toBe("1 / 3");

        const columnGridlineRef = createRef<HTMLDivElement>();
        const rowGridlineRef = createRef<HTMLDivElement>();
        render(
          <Grid columns={3} rows={3}>
            <Gridline
              type="column"
              column={2}
              elementRef={columnGridlineRef}
              row={1}
              rowSpan={1}
            />
            <Gridline
              type="row"
              column={1}
              elementRef={rowGridlineRef}
              row={2}
            />
            <Gridline type="row" column={0} columnSpan={1} row={2} />
          </Grid>
        );

        // Rows 1 through 1, plus the gutters on either side
        expect(columnGridlineRef.current!.style.gridColumn).toBe("4 / span 1");
        expect(columnGridlineRef.current!.style.gridRow).toBe("2 / 5");

        // Columns 1 through the end, plus the gutter before
        expect(rowGridlineRef.current!.style.gridColumn).toBe("2 / 6");
        expect(rowGridlineRef.current!.style.gridRow).toBe("4 / span 1");
      });

      test("resize tracks alongside of the tracks they span", async () => {
        const { gridRef } = renderGridWithSpanningCell();

        // Beside the spanning cell (there is no gridline there)
        await drag({ x: 55, y: 80 }, { x: 65, y: 80 });
        expect(gridRef.current!.getLayout().columns).toEqual({
          "0": 50,
          "1": 50
        });

        // Beside the top row
        await drag({ x: 55, y: 20 }, { x: 65, y: 20 });
        expect(gridRef.current!.getLayout().columns).toEqual({
          "0": 60,
          "1": 40
        });
      });

      test("prevent the rest of their boundary from being resized", async () => {
        const gridRef = createRef<GridImperativeHandle>();
        mockGridLayout({ gridRef, height: 110, gridlineSize: 10, width: 110 });

        // No cells span across the column boundary,
        // but the gridline is only rendered alongside of the top row
        render(
          <Grid columns={2} gridRef={gridRef} rows={2}>
            <TestCell row={0} column={0} />
            <TestCell row={0} column={1} />
            <TestCell row={1} column={0} />
            <TestCell row={1} column={1} />
            <Gridline type="column" column={1} row={0} rowSpan={1} />
          </Grid>
        );

        // Beside the bottom row (where there is no gridline)
        await drag({ x: 55, y: 85 }, { x: 65, y: 85 });
        expect(gridRef.current!.getLayout().columns).toEqual({
          "0": 50,
          "1": 50
        });

        // Beside the top row
        await drag({ x: 55, y: 20 }, { x: 65, y: 20 });
        expect(gridRef.current!.getLayout().columns).toEqual({
          "0": 60,
          "1": 40
        });
      });

      test("resize both axes where they intersect another gridline", async () => {
        const { gridRef } = renderGridWithSpanningCell();

        await drag({ x: 55, y: 55 }, { x: 65, y: 65 });
        expect(gridRef.current!.getLayout()).toEqual({
          columns: { "0": 60, "1": 40 },
          rows: { "0": 60, "1": 40 }
        });
      });

      test("log an error (once) when rendered alongside of a cell that spans across them", async () => {
        const consoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const gridRef = createRef<GridImperativeHandle>();
        mockGridLayout({ gridRef, height: 110, gridlineSize: 10, width: 110 });
        const ui = (rowSpan: number | undefined, disabled = false) => (
          <Grid columns={2} gridRef={gridRef} rows={2}>
            <TestCell row={0} column={0} />
            <TestCell row={0} column={1} />
            <TestCell row={1} column={0} columnSpan={2} />
            <Gridline
              type="column"
              column={1}
              disabled={disabled}
              rowSpan={rowSpan}
            />
          </Grid>
        );

        const { rerender } = render(ui(undefined));
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(
          '<Gridline type="column" column={1} /> overlaps a Cell that spans across it (column: 0, columnSpan: 2, row: 1, rowSpan: 1); use the row and rowSpan props to render gridlines beside the Cell instead'
        );

        // The gridline still works alongside of the other cells,
        // but the spanning cell is not treated as a resize target
        await drag({ x: 55, y: 80 }, { x: 65, y: 80 });
        expect(gridRef.current!.getLayout().columns).toEqual({
          "0": 50,
          "1": 50
        });
        await drag({ x: 55, y: 20 }, { x: 65, y: 20 });
        expect(gridRef.current!.getLayout().columns).toEqual({
          "0": 60,
          "1": 40
        });

        // The same problem is only logged once
        rerender(ui(undefined));
        expect(consoleError).toHaveBeenCalledTimes(1);

        // Until it has been resolved
        rerender(ui(1));
        expect(consoleError).toHaveBeenCalledTimes(1);

        rerender(ui(undefined, true));
        expect(consoleError).toHaveBeenCalledTimes(2);
        expect(consoleError).toHaveBeenLastCalledWith(
          '<Gridline type="column" column={1} disabled /> overlaps a Cell that spans across it (column: 0, columnSpan: 2, row: 1, rowSpan: 1); use the row and rowSpan props to render gridlines beside the Cell instead'
        );
      });

      test("log an error for row gridlines rendered alongside of a cell that spans across them", () => {
        const consoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        render(
          <Grid columns={3} rows={3}>
            <Cell row={1} column={1} rowSpan={2} />
            <Gridline type="row" row={2} column={1} columnSpan={1} />
          </Grid>
        );

        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(
          '<Gridline type="row" row={2} column={1} columnSpan={1} /> overlaps a Cell that spans across it (row: 1, rowSpan: 2, column: 1, columnSpan: 1); use the column and columnSpan props to render gridlines beside the Cell instead'
        );
      });

      test("log an error when overlapping other gridlines along the same boundary", () => {
        const consoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        render(
          <Grid columns={2} rows={3}>
            <Gridline type="column" column={1} row={0} rowSpan={2} />
            <Gridline type="column" column={1} row={1} />
          </Grid>
        );

        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(
          '<Gridline type="column" column={1} row={0} rowSpan={2} /> overlaps <Gridline type="column" column={1} row={1} />'
        );
      });

      test("only the first (enabled) gridline along a boundary is in the tab order", () => {
        const firstRef = createRef<HTMLDivElement>();
        const secondRef = createRef<HTMLDivElement>();
        const ui = (firstDisabled: boolean) => (
          <Grid columns={2} rows={3}>
            <TestCell row={1} column={0} columnSpan={2} />
            <Gridline
              type="column"
              column={1}
              disabled={firstDisabled}
              elementRef={firstRef}
              row={0}
              rowSpan={1}
            />
            <Gridline type="column" column={1} elementRef={secondRef} row={2} />
          </Grid>
        );

        const { rerender } = render(ui(false));
        expect(firstRef.current).toHaveAttribute("tabindex", "0");
        expect(secondRef.current).toHaveAttribute("tabindex", "-1");

        rerender(ui(true));
        expect(firstRef.current).not.toHaveAttribute("tabindex");
        expect(secondRef.current).toHaveAttribute("tabindex", "0");
      });

      test("share hover and active state with other gridlines along the same boundary", async () => {
        const gridRef = createRef<GridImperativeHandle>();
        const firstRef = createRef<HTMLDivElement>();
        const secondRef = createRef<HTMLDivElement>();
        const rowGridlineRef = createRef<HTMLDivElement>();
        mockGridLayout({ gridRef, height: 170, gridlineSize: 10, width: 110 });
        render(
          <Grid columns={2} gridRef={gridRef} rows={3}>
            <TestCell row={0} column={0} />
            <TestCell row={0} column={1} />
            <TestCell row={1} column={0} columnSpan={2} />
            <TestCell row={2} column={0} />
            <TestCell row={2} column={1} />
            <Gridline
              type="column"
              column={1}
              elementRef={firstRef}
              row={0}
              rowSpan={1}
            />
            <Gridline type="column" column={1} elementRef={secondRef} row={2} />
            <Gridline type="row" elementRef={rowGridlineRef} row={1} />
          </Grid>
        );

        await userEvent.pointer({ coords: { clientX: 55, clientY: 20 } });
        expect(firstRef.current).toHaveAttribute("data-separator", "hover");
        expect(secondRef.current).toHaveAttribute("data-separator", "hover");
        expect(rowGridlineRef.current).toHaveAttribute(
          "data-separator",
          "inactive"
        );

        await userEvent.pointer({
          keys: "[MouseLeft>]",
          coords: { clientX: 55, clientY: 20 }
        });
        expect(firstRef.current).toHaveAttribute("data-separator", "active");
        expect(secondRef.current).toHaveAttribute("data-separator", "active");

        await userEvent.pointer({
          keys: "[/MouseLeft]",
          coords: { clientX: 55, clientY: 20 }
        });
      });

      test("can be resized using the keyboard", async () => {
        const { getColumnGridline, gridRef } = renderGridWithSpanningCell();

        act(() => getColumnGridline().focus());
        await userEvent.keyboard("{ArrowRight}");
        expect(gridRef.current!.getLayout().columns).toEqual({
          "0": 55,
          "1": 45
        });
      });
    });

    test("resizes tracks using the keyboard", async () => {
      const { getColumnGridline, getRowGridline, gridRef } =
        renderGridWithGridlines();

      act(() => getColumnGridline().focus());
      await userEvent.keyboard("{ArrowRight}");
      await userEvent.keyboard("{ArrowDown}"); // No-op for a column gridline
      expect(gridRef.current!.getLayout()).toEqual({
        columns: { "0": 55, "1": 45 },
        rows: { "0": 50, "1": 50 }
      });
      expect(getColumnGridline()).toHaveAttribute("aria-valuenow", "55");

      act(() => getRowGridline().focus());
      await userEvent.keyboard("{ArrowDown}");
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 55, "1": 45 });

      // The bottom row is collapsible
      await userEvent.keyboard("{End}");
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 100, "1": 0 });

      await userEvent.keyboard("{Home}");
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 0, "1": 100 });
    });

    test("resizes tracks by dragging gridlines", async () => {
      const { gridRef } = renderGridWithGridlines();

      // Available size is 100px (110px minus a 10px gridline)
      await drag({ x: 55, y: 20 }, { x: 65, y: 20 });
      expect(gridRef.current!.getLayout()).toEqual({
        columns: { "0": 60, "1": 40 },
        rows: { "0": 50, "1": 50 }
      });

      // Gridlines intersect
      await drag({ x: 65, y: 55 }, { x: 55, y: 65 });
      expect(gridRef.current!.getLayout()).toEqual({
        columns: { "0": 50, "1": 50 },
        rows: { "0": 60, "1": 40 }
      });
    });

    test("does not resize tracks using a disabled gridline", async () => {
      const { getColumnGridline, gridRef } = renderGridWithGridlines({
        columnGridlineDisabled: true
      });

      const columnGridline = getColumnGridline();
      expect(columnGridline).toHaveAttribute("aria-disabled", "true");
      expect(columnGridline).toHaveAttribute("data-separator", "disabled");
      expect(columnGridline).not.toHaveAttribute("tabindex");

      act(() => columnGridline.focus());
      await userEvent.keyboard("{ArrowRight}");
      await drag({ x: 55, y: 20 }, { x: 65, y: 20 });
      expect(gridRef.current!.getLayout().columns).toEqual({
        "0": 50,
        "1": 50
      });

      // The intersecting (enabled) row gridline still works
      await drag({ x: 55, y: 55 }, { x: 65, y: 65 });
      expect(gridRef.current!.getLayout()).toEqual({
        columns: { "0": 50, "1": 50 },
        rows: { "0": 60, "1": 40 }
      });
    });

    test("logs an error for invalid placements", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const expectError = (element: ReactElement, message: string) => {
        consoleError.mockClear();
        const { unmount } = render(element);
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(message);
        unmount();
      };

      expectError(
        <Grid columns={2} rows={2}>
          <Gridline type="column" column={2} />
        </Grid>,
        "Invalid column Gridline column (2); must be between 1 and 1"
      );
      expectError(
        <Grid columns={2} rows={3}>
          <Gridline type="row" row={0} />
        </Grid>,
        "Invalid row Gridline row (0); must be between 1 and 2"
      );
      expectError(
        <Grid columns={2} rows={3}>
          <Gridline type="column" column={1} row={3} />
        </Grid>,
        "Invalid column Gridline row (3); must be between 0 and 2"
      );
      expectError(
        <Grid columns={3} rows={2}>
          <Gridline type="row" row={1} column={1} columnSpan={3} />
        </Grid>,
        "Invalid row Gridline columnSpan (3); Grid has 3 columns"
      );
    });

    test("treats gridlines that are not between two tracks as disabled", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const gridlineRef = createRef<HTMLDivElement>();
      render(
        <Grid columns={2} rows={2}>
          <Gridline elementRef={gridlineRef} type="column" column={2} />
        </Grid>
      );

      const gridline = gridlineRef.current!;
      expect(gridline.getAttribute("aria-disabled")).toBe("true");
      expect(gridline.getAttribute("data-separator")).toBe("disabled");
      expect(gridline.hasAttribute("tabindex")).toBe(false);

      // Keyboard events should be ignored (rather than throwing)
      consoleError.mockClear();
      fireEvent.keyDown(gridline, { key: "ArrowRight" });
      fireEvent.keyDown(gridline, { key: "Enter" });
      expect(consoleError).not.toHaveBeenCalled();
    });

    test("logs placement errors again after they have been fixed and reintroduced", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const Test = ({ rows }: { rows: number }) => (
        <Grid columns={2} rows={rows}>
          <Gridline type="row" row={2} />
        </Grid>
      );

      const { rerender } = render(<Test rows={3} />);
      expect(consoleError).not.toHaveBeenCalled();

      // Rows are removed before the gridline is
      rerender(<Test rows={2} />);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith(
        "Invalid row Gridline row (2); must be between 1 and 1"
      );

      // Only logged once while the problem persists
      rerender(<Test rows={2} />);
      expect(consoleError).toHaveBeenCalledTimes(1);

      rerender(<Test rows={3} />);
      rerender(<Test rows={2} />);
      expect(consoleError).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cell", () => {
    test("logs an error for invalid placements", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { rerender } = render(
        <Grid columns={2} rows={2}>
          <Cell row={1} column={1} columnSpan={2} />
        </Grid>
      );
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith(
        "Invalid Cell column placement (column: 1, columnSpan: 2); Grid has 2 columns"
      );

      consoleError.mockClear();
      rerender(
        <Grid columns={2} rows={2}>
          <Cell row={-1} column={0} />
        </Grid>
      );
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith(
        "Invalid Cell row placement (row: -1, rowSpan: 1); Grid has 2 rows"
      );
    });

    test("must be rendered within a Grid", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<Cell row={0} column={0} />)).toThrow(
        "Grid Context not found"
      );
    });

    test("can contain nested Groups", () => {
      const gridRef = createRef<GridImperativeHandle>();
      mockGridLayout({ gridRef });
      const { getByTestId } = render(
        <Group>
          <Panel id="outer">
            <Grid columns={2} gridRef={gridRef} rows={1}>
              <Cell row={0} column={0}>
                <Group>
                  <Panel id="inner" />
                </Group>
              </Cell>
            </Grid>
          </Panel>
        </Group>
      );

      expect(getByTestId("inner")).toBeInTheDocument();
    });
  });
});

describe("Grid (before mount)", () => {
  test("approximates the default layout from track default sizes", async () => {
    const { renderToString } = await import("react-dom/server");

    const html = renderToString(
      <Grid
        columns={[{ defaultSize: "20%" }, {}, {}]}
        rows={[{ defaultSize: 100 }, {}]}
      >
        <Cell row={0} column={0} />
      </Grid>
    );

    expect(html).toContain(
      "grid-template-columns:minmax(0, 20fr) minmax(0, 40fr) minmax(0, 40fr)"
    );
    expect(html).toContain("grid-template-rows:100px minmax(0, 100fr)");
  });

  test("uses the default layout", async () => {
    const { renderToString } = await import("react-dom/server");

    const html = renderToString(
      <Grid
        columns={2}
        defaultLayout={{ columns: { "0": 30, "1": 70 } }}
        rows={1}
      >
        <Cell row={0} column={0} />
        <Gridline type="column" column={1} />
      </Grid>
    );

    expect(html).toContain(
      "grid-template-columns:minmax(0, 30fr) auto minmax(0, 70fr)"
    );
  });
});
