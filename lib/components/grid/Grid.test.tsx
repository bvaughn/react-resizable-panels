import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Group } from "../group/Group";
import { Panel } from "../panel/Panel";
import { Cell } from "./Cell";
import { Grid } from "./Grid";
import { GridSeparator } from "./GridSeparator";
import type { GridImperativeHandle, GridLayout, GridTrackProps } from "./types";

// Lays out a Grid (of the specified size) at the origin using the Grid's current layout,
// with cells positioned according to their row/column placement
// (jsdom does not support CSS Grid layout)
function mockGridLayout({
  gridRef,
  height = 100,
  separatorSize = 0,
  width = 100
}: {
  gridRef: { current: GridImperativeHandle | null };
  height?: number;
  separatorSize?: number;
  width?: number;
}) {
  const getOffsets = (
    layout: { [id: string]: number },
    size: number,
    trackCount: number
  ) => {
    const available = size - separatorSize * (trackCount - 1);
    const offsets: number[] = [];
    let offset = 0;
    for (let index = 0; index < trackCount; index++) {
      offsets.push(offset);
      const percentage = layout[`${index}`] ?? 100 / trackCount;
      offset += (percentage / 100) * available + separatorSize;
    }
    offsets.push(size + separatorSize);
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
      const right = columns[column + columnSpan] - separatorSize;
      const bottom = rows[row + rowSpan] - separatorSize;

      return new DOMRect(left, top, right - left, bottom - top);
    } else if (element.hasAttribute("data-separator")) {
      const orientation = element.getAttribute("aria-orientation");
      const index = parseInt(element.getAttribute("data-index")!);
      if (orientation === "vertical") {
        const left = columns[index] - separatorSize;
        return new DOMRect(left, 0, separatorSize, height);
      } else {
        const top = rows[index] - separatorSize;
        return new DOMRect(0, top, width, separatorSize);
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

      const row = gridRef.current!.getTrack("row", 1);
      expect(row.getSize()).toEqual({ asPercentage: 50, inPixels: 50 });
      expect(row.isCollapsed()).toBe(false);

      act(() => row.collapse());
      expect(row.isCollapsed()).toBe(true);
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 90, "1": 10 });

      act(() => row.expand());
      expect(row.isCollapsed()).toBe(false);
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 50, "1": 50 });

      const column = gridRef.current!.getTrack("column", "0");
      act(() => column.resize("25px"));
      expect(gridRef.current!.getLayout().columns).toEqual({
        "0": 25,
        "1": 75
      });
      expect(column.getSize()).toEqual({ asPercentage: 25, inPixels: 25 });
    });
  });

  describe("GridSeparator", () => {
    function renderGridWithSeparators() {
      const gridRef = createRef<GridImperativeHandle>();
      mockGridLayout({ gridRef, height: 110, separatorSize: 10, width: 110 });

      const result = render(
        <Grid
          columns={2}
          gridRef={gridRef}
          rows={[{}, { collapsible: true, minSize: 20 }]}
        >
          <TestCell row={0} column={0} />
          <TestCell row={0} column={1} />
          <GridSeparator column={1} data-index={1} id="column-separator" />
          <GridSeparator row={1} data-index={1} id="row-separator" />
          <TestCell row={1} column={0} />
          <TestCell row={1} column={1} />
        </Grid>
      );

      return { ...result, gridRef };
    }

    test("places separators within gutter tracks", () => {
      const { getByTestId } = renderGridWithSeparators();

      const grid = document.querySelector("[data-grid]") as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe(
        "minmax(0, 50fr) auto minmax(0, 50fr)"
      );
      expect(grid.style.gridTemplateRows).toBe(
        "minmax(0, 50fr) auto minmax(0, 50fr)"
      );

      expect(getByTestId("cell-1-1").style.gridColumn).toBe("3 / span 1");
      expect(getByTestId("cell-1-1").style.gridRow).toBe("3 / span 1");

      const columnSeparator = getByTestId("column-separator");
      expect(columnSeparator.style.gridColumn).toBe("2 / span 1");
      expect(columnSeparator.style.gridRow).toBe("1 / -1");

      const rowSeparator = getByTestId("row-separator");
      expect(rowSeparator.style.gridColumn).toBe("1 / -1");
      expect(rowSeparator.style.gridRow).toBe("2 / span 1");
    });

    test("sets aria attributes", () => {
      const { getByTestId } = renderGridWithSeparators();

      const columnSeparator = getByTestId("column-separator");
      expect(columnSeparator).toHaveAttribute("role", "separator");
      expect(columnSeparator).toHaveAttribute("aria-orientation", "vertical");
      expect(columnSeparator).toHaveAttribute("aria-controls", "0");
      expect(columnSeparator).toHaveAttribute("aria-valuenow", "50");
      expect(columnSeparator).toHaveAttribute("aria-valuemin", "0");
      expect(columnSeparator).toHaveAttribute("aria-valuemax", "100");

      const rowSeparator = getByTestId("row-separator");
      expect(rowSeparator).toHaveAttribute("aria-orientation", "horizontal");
      // The bottom row is collapsible, so the top row can grow to 100%
      expect(rowSeparator).toHaveAttribute("aria-valuemax", "100");
    });

    test("resizes tracks using the keyboard", async () => {
      const { getByTestId, gridRef } = renderGridWithSeparators();

      act(() => getByTestId("column-separator").focus());
      await userEvent.keyboard("{ArrowRight}");
      await userEvent.keyboard("{ArrowDown}"); // No-op for a column separator
      expect(gridRef.current!.getLayout()).toEqual({
        columns: { "0": 55, "1": 45 },
        rows: { "0": 50, "1": 50 }
      });
      expect(getByTestId("column-separator")).toHaveAttribute(
        "aria-valuenow",
        "55"
      );

      act(() => getByTestId("row-separator").focus());
      await userEvent.keyboard("{ArrowDown}");
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 55, "1": 45 });

      // The bottom row is collapsible
      await userEvent.keyboard("{End}");
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 100, "1": 0 });

      await userEvent.keyboard("{Home}");
      expect(gridRef.current!.getLayout().rows).toEqual({ "0": 0, "1": 100 });
    });

    test("resizes tracks by dragging separators", async () => {
      const { gridRef } = renderGridWithSeparators();

      // Available size is 100px (110px minus a 10px separator)
      await drag({ x: 55, y: 20 }, { x: 65, y: 20 });
      expect(gridRef.current!.getLayout()).toEqual({
        columns: { "0": 60, "1": 40 },
        rows: { "0": 50, "1": 50 }
      });

      // Separators intersect
      await drag({ x: 65, y: 55 }, { x: 55, y: 65 });
      expect(gridRef.current!.getLayout()).toEqual({
        columns: { "0": 50, "1": 50 },
        rows: { "0": 60, "1": 40 }
      });
    });

    test("supports separators that span a subset of the grid", () => {
      const gridRef = createRef<GridImperativeHandle>();
      mockGridLayout({ gridRef });
      const { getByTestId } = render(
        <Grid columns={3} gridRef={gridRef} rows={3}>
          <GridSeparator column={2} rowStart={1} rowSpan={2} id="separator" />
          <Cell row={0} column={0} />
        </Grid>
      );

      const separator = getByTestId("separator");
      expect(separator.style.gridColumn).toBe("4 / span 1");
      expect(separator.style.gridRow).toBe("2 / span 2");
      expect(separator).toHaveAttribute("aria-controls", "1");
    });

    test("validates placement", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() =>
        render(
          <Grid columns={2} rows={2}>
            <GridSeparator column={2} />
          </Grid>
        )
      ).toThrow("Invalid GridSeparator column (2); must be between 1 and 1");
    });
  });

  describe("Cell", () => {
    test("validates placement", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() =>
        render(
          <Grid columns={2} rows={2}>
            <Cell row={1} column={1} columnSpan={2} />
          </Grid>
        )
      ).toThrow(
        "Invalid Cell column placement (column: 1, columnSpan: 2); Grid has 2 columns"
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
        <GridSeparator column={1} />
      </Grid>
    );

    expect(html).toContain(
      "grid-template-columns:minmax(0, 30fr) auto minmax(0, 70fr)"
    );
  });
});
