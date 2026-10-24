import { type Ref, useState } from "react";
import type { GridImperativeHandle } from "react-resizable-panels";
import { MaximizeButton } from "../MaximizeButton";
import { Cell } from "../styled-panels/Cell";
import { Grid } from "../styled-panels/Grid";

const COLUMNS = ["left", "right"];
const ROWS = ["top", "bottom"];
const LABELS = [
  ["A", "B"],
  ["C", "D"]
];
const MAXIMIZED_SIZE = 75;

/**
 * Demonstrates the imperative Grid API with maximize/restore toggles;
 * shared by the useGridRef and useGridCallbackRef pages.
 */
export function GridMaximizeDemo({
  getGrid,
  gridRef
}: {
  getGrid: () => GridImperativeHandle | null;
  gridRef: Ref<GridImperativeHandle | null>;
}) {
  const [maximized, setMaximized] = useState<
    { column: string; row: string } | undefined
  >();

  const toggle = (column: string, row: string) => {
    const grid = getGrid();
    if (maximized?.column === column && maximized.row === row) {
      grid?.setLayout({
        columns: { left: 50, right: 50 },
        rows: { top: 50, bottom: 50 }
      });
    } else {
      grid?.getTrackById("column", column).resize(`${MAXIMIZED_SIZE}%`);
      grid?.getTrackById("row", row).resize(`${MAXIMIZED_SIZE}%`);
    }
  };

  return (
    <Grid
      className="h-60!"
      columns={COLUMNS.map((id) => ({ id, minSize: "20%" }))}
      gridRef={gridRef}
      onLayoutChanged={({ columns, rows }) => {
        const isMaximized = (id: string, layout: { [id: string]: number }) =>
          Math.round(layout[id]) === MAXIMIZED_SIZE;
        const column = COLUMNS.find((id) => isMaximized(id, columns));
        const row = ROWS.find((id) => isMaximized(id, rows));
        setMaximized(column && row ? { column, row } : undefined);
      }}
      rows={ROWS.map((id) => ({ id, minSize: "20%" }))}
    >
      {ROWS.map((row, rowIndex) =>
        COLUMNS.map((column, columnIndex) => (
          <Cell
            className="relative"
            column={columnIndex}
            key={`${column}-${row}`}
            row={rowIndex}
          >
            {LABELS[rowIndex][columnIndex]}
            <MaximizeButton
              isMaximized={
                maximized?.column === column && maximized.row === row
              }
              label={`${row} ${column} cell`}
              onClick={() => toggle(column, row)}
            />
          </Cell>
        ))
      )}
    </Grid>
  );
}
