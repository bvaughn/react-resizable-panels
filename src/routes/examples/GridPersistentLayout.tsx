import { Cell, Grid, useDefaultGridLayout } from "react-resizable-panels";

// <begin>

function Dashboard() {
  const { defaultLayout, onLayoutChanged } = useDefaultGridLayout({
    id: "unique-layout-id"
  });

  return (
    <Grid
      columns={2}
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
      rows={2}
    >
      <Cell column={0} row={0}>
        A
      </Cell>
      <Cell column={1} row={0}>
        B
      </Cell>
      <Cell column={0} row={1}>
        C
      </Cell>
      <Cell column={1} row={1}>
        D
      </Cell>
    </Grid>
  );
}

// <end>

export { Dashboard };
