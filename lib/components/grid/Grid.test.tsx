import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, StrictMode } from "react";
import { describe, expect, test, vi } from "vitest";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Separator } from "../separator/Separator";
import { Cell } from "./Cell";
import { Grid } from "./Grid";
import type { GridImperativeHandle } from "./types";

function mockGeometry() {
  setElementBoundsFunction((element) => {
    if (element.hasAttribute("data-grid")) return new DOMRect(0, 0, 1004, 1004);
    if (element.dataset.axis === "column") return new DOMRect(500, 0, 4, 1004);
    if (element.dataset.axis === "row") return new DOMRect(0, 500, 1004, 4);
  });
}
function cells() {
  return (
    <>
      <Cell row={0} column={0}>
        A
      </Cell>
      <Cell row={0} column={1}>
        B
      </Cell>
      <Cell row={1} column={0}>
        C
      </Cell>
      <Cell row={1} column={1}>
        D
      </Cell>
    </>
  );
}
function pointer(
  target: Element | Document,
  type: string,
  x: number,
  y: number
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    buttons: type === "pointerup" ? 0 : 1,
    button: 0
  });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: "mouse" },
    isPrimary: { value: true }
  });
  fireEvent(target, event);
}

describe("Grid", () => {
  test("infers tracks, renders cells in a shared grid and exposes keyboard separators", () => {
    mockGeometry();
    const ref = createRef<GridImperativeHandle>();
    render(
      <StrictMode>
        <Grid gridRef={ref}>{cells()}</Grid>
      </StrictMode>
    );
    expect(ref.current?.getLayout()).toEqual({
      rows: { 0: 50, 1: 50 },
      columns: { 0: 50, 1: 50 }
    });
    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(2);
    fireEvent.keyDown(separators[0], { key: "ArrowRight" });
    expect(ref.current?.getLayout().columns).toEqual({ 0: 55, 1: 45 });
    expect(ref.current?.getLayout().rows).toEqual({ 0: 50, 1: 50 });
    fireEvent.keyDown(separators[1], { key: "ArrowDown", shiftKey: true });
    expect(ref.current?.getLayout().rows).toEqual({ 0: 60, 1: 40 });
  });
  test("uses pixel defaults after measuring and supports custom disabled separators", () => {
    mockGeometry();
    const ref = createRef<GridImperativeHandle>();
    render(
      <Grid
        gridRef={ref}
        columns={[{ id: "left", defaultSize: 200 }, { id: "right" }]}
      >
        {cells()}
        <Separator axis="column" after={0} disabled aria-label="Columns" />
      </Grid>
    );
    expect(ref.current?.getLayout().columns).toEqual({ left: 20, right: 80 });
    expect(screen.getAllByRole("separator")).toHaveLength(2);
    fireEvent.keyDown(screen.getByRole("separator", { name: "Columns" }), {
      key: "ArrowRight"
    });
    expect(ref.current?.getLayout().columns).toEqual({ left: 20, right: 80 });
  });
  test("masks spanning cells and retains a single tab stop per logical boundary", () => {
    mockGeometry();
    render(
      <Grid>
        <Cell row={0} column={0}>
          A
        </Cell>
        <Cell row={0} column={1}>
          B
        </Cell>
        <Cell row={1} column={0} columnSpan={2}>
          C
        </Cell>
        <Cell row={2} column={0}>
          D
        </Cell>
        <Cell row={2} column={1}>
          E
        </Cell>
      </Grid>
    );
    const vertical = screen
      .getAllByRole("separator")
      .filter(
        (element) => element.getAttribute("aria-orientation") === "vertical"
      );
    expect(vertical).toHaveLength(2);
    expect(vertical.map((element) => element.tabIndex)).toEqual([0, -1]);
    expect(screen.getByText("C").style.gridColumn).toBe("1 / span 3");
  });
  test("commits both axes atomically at an intersection and completes once", () => {
    mockGeometry();
    const ref = createRef<GridImperativeHandle>();
    const change = vi.fn();
    const changed = vi.fn();
    render(
      <Grid
        id="grid"
        gridRef={ref}
        onLayoutChange={change}
        onLayoutChanged={changed}
      >
        {cells()}
      </Grid>
    );
    change.mockClear();
    changed.mockClear();
    pointer(screen.getByTestId("grid"), "pointerdown", 502, 502);
    pointer(document, "pointermove", 602, 702);
    expect(ref.current?.getLayout()).toEqual({
      rows: { 0: 70, 1: 30 },
      columns: { 0: 60, 1: 40 }
    });
    expect(change).toHaveBeenCalledTimes(1);
    expect(changed).not.toHaveBeenCalled();
    pointer(document, "pointerup", 602, 702);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][1]).toEqual({ isUserInteraction: true });
    expect(document.body.style.userSelect).toBe("");
  });
  test("cancels pointer changes and cleans up document listeners on unmount", () => {
    mockGeometry();
    const ref = createRef<GridImperativeHandle>();
    const view = render(
      <Grid id="grid" gridRef={ref}>
        {cells()}
      </Grid>
    );
    pointer(screen.getByTestId("grid"), "pointerdown", 502, 100);
    pointer(document, "pointermove", 602, 100);
    pointer(document, "pointercancel", 602, 100);
    expect(ref.current?.getLayout().columns).toEqual({ 0: 50, 1: 50 });
    pointer(screen.getByTestId("grid"), "pointerdown", 502, 100);
    view.unmount();
    expect(document.body.style.userSelect).toBe("");
    expect(document.body.style.cursor).toBe("");
    pointer(document, "pointermove", 702, 100);
  });
  test("validates imperative updates atomically and protects stored layouts from mutation", () => {
    mockGeometry();
    const ref = createRef<GridImperativeHandle>();
    render(
      <Grid gridRef={ref} columns={[{ minSize: "20%" }, {}]}>
        {cells()}
      </Grid>
    );
    act(() => {
      ref.current?.setLayout({
        rows: { 0: 40, 1: 60 },
        columns: { 0: 5, 1: 95 }
      });
    });
    expect(ref.current?.getLayout()).toEqual({
      rows: { 0: 40, 1: 60 },
      columns: { 0: 20, 1: 80 }
    });
    const snapshot = ref.current!.getLayout();
    snapshot.rows[0] = 0;
    expect(ref.current?.getLayout().rows[0]).toBe(40);
    expect(() =>
      ref.current?.setLayout({
        rows: { 0: 80, 1: 20 },
        columns: { 0: NaN, 1: 0 }
      })
    ).toThrow();
    expect(ref.current?.getLayout().rows[0]).toBe(40);
  });
});

test("revalidates pixel constraints when the container shrinks", () => {
  mockGeometry();
  const ref = createRef<GridImperativeHandle>();
  render(
    <Grid gridRef={ref} columns={[{ minSize: 300 }, {}]}>
      {cells()}
    </Grid>
  );
  act(() => {
    ref.current?.setLayout({
      rows: { 0: 50, 1: 50 },
      columns: { 0: 30, 1: 70 }
    });
  });
  act(() => {
    setElementBoundsFunction((element) =>
      element.hasAttribute("data-grid")
        ? new DOMRect(0, 0, 504, 1004)
        : undefined
    );
  });
  expect(ref.current?.getLayout().columns).toEqual({ 0: 60, 1: 40 });
});

test("defers pixel defaults and callbacks until a hidden grid becomes visible", () => {
  const changed = vi.fn();
  const ref = createRef<GridImperativeHandle>();
  render(
    <Grid
      gridRef={ref}
      columns={[{ defaultSize: 200 }, {}]}
      onLayoutChanged={changed}
    >
      {cells()}
    </Grid>
  );
  expect(changed).not.toHaveBeenCalled();
  act(() => mockGeometry());
  expect(ref.current?.getLayout().columns).toEqual({ 0: 20, 1: 80 });
  expect(changed).toHaveBeenCalledTimes(1);
});

test("keeps track identities when definitions are reordered", () => {
  mockGeometry();
  const ref = createRef<GridImperativeHandle>();
  const view = render(
    <Grid
      gridRef={ref}
      columns={[{ id: "a", defaultSize: "30%" }, { id: "b" }]}
    >
      {cells()}
    </Grid>
  );
  view.rerender(
    <Grid
      gridRef={ref}
      columns={[{ id: "b" }, { id: "a", defaultSize: "30%" }]}
    >
      {cells()}
    </Grid>
  );
  expect(ref.current?.getLayout().columns).toEqual({ b: 70, a: 30 });
});

test("a disabled preceding track does not disable a movable boundary", () => {
  mockGeometry();
  const ref = createRef<GridImperativeHandle>();
  render(
    <Grid gridRef={ref} columns={[{}, { disabled: true }, {}]} rows={[{}]}>
      <Cell row={0} column={0}>
        A
      </Cell>
      <Cell row={0} column={1}>
        B
      </Cell>
      <Cell row={0} column={2}>
        C
      </Cell>
    </Grid>
  );
  const before = ref.current!.getLayout().columns;
  const separator = screen.getAllByRole("separator")[1];
  expect(separator).not.toHaveAttribute("aria-disabled");
  fireEvent.keyDown(separator, { key: "ArrowRight" });
  const after = ref.current!.getLayout().columns;
  expect(after[1]).toBe(before[1]);
  expect(after[0]).toBeGreaterThan(before[0]);
  expect(after[2]).toBeLessThan(before[2]);
});

test("reports both cell dimensions from ResizeObserver", () => {
  setElementBoundsFunction((element) =>
    element.hasAttribute("data-grid")
      ? new DOMRect(0, 0, 1000, 500)
      : new DOMRect(0, 0, 400, 200)
  );
  const resize = vi.fn();
  render(
    <Grid rows={[{}]} columns={[{}]}>
      <Cell id="cell" row={0} column={0} onResize={resize}>
        A
      </Cell>
    </Grid>
  );
  expect(resize).toHaveBeenCalledWith(
    {
      width: { inPixels: 400, asPercentage: 40 },
      height: { inPixels: 200, asPercentage: 40 }
    },
    "cell",
    undefined
  );
});
