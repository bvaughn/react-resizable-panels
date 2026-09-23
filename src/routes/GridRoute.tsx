import { useState } from "react";
import { Box, Header } from "react-lib-tools";
import {
  Cell,
  Grid,
  Separator,
  useGridRef,
  type GridLayout
} from "react-resizable-panels";

export default function GridRoute() {
  const gridRef = useGridRef();
  const [layout, setLayout] = useState<GridLayout>();
  const [spanning, setSpanning] = useState(false);
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Resizable grids" />
      <p>
        Rows and columns share their sizes across every cell. Drag a separator
        to resize one axis, or drag a crossing to resize both. Focus a separator
        and use arrow keys, Home, or End to resize with the keyboard.
      </p>
      <div className="flex gap-4">
        <button
          className="rounded border px-3 py-1"
          onClick={() => setSpanning(!spanning)}
        >
          {spanning ? "Split top row" : "Span top row"}
        </button>
        <button
          className="rounded border px-3 py-1"
          onClick={() =>
            gridRef.current?.setLayout({
              rows: { top: 50, bottom: 50 },
              columns: { left: 50, right: 50 }
            })
          }
        >
          Reset layout
        </button>
      </div>
      <Grid
        gridRef={gridRef}
        style={{ height: 360 }}
        gap={6}
        rows={[
          { id: "top", minSize: 60 },
          { id: "bottom", minSize: 60 }
        ]}
        columns={[
          { id: "left", minSize: 100 },
          { id: "right", minSize: 100 }
        ]}
        onLayoutChange={setLayout}
      >
        <Cell
          id="grid-a"
          className="flex items-center justify-center bg-sky-500/15"
          row={0}
          column={0}
          columnSpan={spanning ? 2 : 1}
        >
          A
        </Cell>
        {!spanning && (
          <Cell
            id="grid-b"
            className="flex items-center justify-center bg-violet-500/15"
            row={0}
            column={1}
          >
            B
          </Cell>
        )}
        <Cell
          id="grid-c"
          className="flex items-center justify-center bg-emerald-500/15"
          row={1}
          column={0}
        >
          C
        </Cell>
        <Cell
          id="grid-d"
          className="flex items-center justify-center bg-amber-500/15"
          row={1}
          column={1}
        >
          D
        </Cell>
        <Separator
          axis="column"
          after={0}
          aria-label="Left column"
          className="focus-visible:outline-2 focus-visible:outline-sky-500"
        />
        <Separator
          axis="row"
          after={0}
          aria-label="Top row"
          className="focus-visible:outline-2 focus-visible:outline-sky-500"
        />
      </Grid>
      <pre className="text-sm">{JSON.stringify(layout, null, 2)}</pre>
      <p>
        Set sizes and constraints on rows and columns. Cells use zero-based
        positions and optional rowSpan and columnSpan. Separators are generated
        automatically; explicit separators customize a boundary.
      </p>
      <pre className="overflow-auto text-sm">{`<Grid columns={[{ minSize: 100 }, { minSize: 100 }]}>
  <Cell row={0} column={0} columnSpan={2}>A</Cell>
  <Cell row={1} column={0}>C</Cell>
  <Cell row={1} column={1}>D</Cell>
  <Separator axis="column" after={0} aria-label="Left column" />
</Grid>`}</pre>
    </Box>
  );
}
