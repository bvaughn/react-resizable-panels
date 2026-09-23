import { useState } from "react";
import { Cell, Grid, Separator, type GridLayout } from "react-resizable-panels";

export function GridRoute() {
  const [spanning, setSpanning] = useState(false);
  const [layout, setLayout] = useState<GridLayout>();
  const [disabled, setDisabled] = useState(false);
  return (
    <>
      <button onClick={() => setSpanning(!spanning)}>Toggle span</button>
      <button onClick={() => setDisabled(!disabled)}>Toggle disabled</button>
      <Grid
        id="grid"
        style={{ width: 804, height: 404 }}
        columns={[{ minSize: 100 }, { minSize: 100 }]}
        rows={[{ minSize: 50 }, { minSize: 50 }]}
        onLayoutChanged={setLayout}
        disabled={disabled}
      >
        <Cell id="a" row={0} column={0} columnSpan={spanning ? 2 : 1}>
          A
        </Cell>
        {!spanning && (
          <Cell id="b" row={0} column={1}>
            B
          </Cell>
        )}
        <Cell id="c" row={1} column={0}>
          C
        </Cell>
        <Cell id="d" row={1} column={1}>
          D
        </Cell>
        <Separator axis="column" after={0} aria-label="Columns" />
        <Separator axis="row" after={0} aria-label="Rows" />
      </Grid>
      <pre data-testid="layout">{JSON.stringify(layout)}</pre>
    </>
  );
}
