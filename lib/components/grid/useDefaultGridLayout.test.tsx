import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { setDefaultElementBounds } from "../../utils/test/mockBoundingClientRect";
import type { LayoutStorage } from "../group/types";
import { Cell } from "./Cell";
import { Grid } from "./Grid";
import type { GridImperativeHandle } from "./types";
import { useDefaultGridLayout } from "./useDefaultGridLayout";

function createStorage(values: { [key: string]: string } = {}) {
  return {
    getItem: (key: string) => values[key] ?? null,
    setItem: (key: string, value: string) => {
      values[key] = value;
    },
    values
  } satisfies LayoutStorage & { values: { [key: string]: string } };
}

function TestGrid({
  gridRef,
  storage
}: {
  gridRef: { current: GridImperativeHandle | null };
  storage: LayoutStorage;
}) {
  const { defaultLayout, onLayoutChanged } = useDefaultGridLayout({
    id: "test",
    storage
  });

  return (
    <Grid
      columns={2}
      defaultLayout={defaultLayout}
      gridRef={gridRef}
      onLayoutChanged={onLayoutChanged}
      rows={2}
    >
      <Cell row={0} column={0} />
    </Grid>
  );
}

describe("useDefaultGridLayout", () => {
  test("saves and restores layouts", () => {
    setDefaultElementBounds(new DOMRect(0, 0, 100, 100));

    const storage = createStorage();
    const gridRef = createRef<GridImperativeHandle>();

    const { unmount } = render(
      <TestGrid gridRef={gridRef} storage={storage} />
    );
    act(() => {
      gridRef.current!.setLayout({
        columns: { "0": 25, "1": 75 },
        rows: { "0": 40, "1": 60 }
      });
    });

    expect(
      JSON.parse(storage.values["react-resizable-panels:grid:test"])
    ).toEqual({
      columns: { "0": 25, "1": 75 },
      rows: { "0": 40, "1": 60 }
    });

    unmount();

    render(<TestGrid gridRef={gridRef} storage={storage} />);
    expect(gridRef.current!.getLayout()).toEqual({
      columns: { "0": 25, "1": 75 },
      rows: { "0": 40, "1": 60 }
    });
  });
});
