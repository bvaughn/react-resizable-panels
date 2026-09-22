import { Cell, Grid, useGridRef } from "react-resizable-panels";

function GridImperativeApi() {
  // <begin>

  const gridRef = useGridRef();

  const resetLayout = () => {
    gridRef.current?.setLayout({
      columns: { "0": 50, "1": 50 },
      rows: { "0": 50, "1": 50 }
    });
  };

  const toggleBottomRow = () => {
    const row = gridRef.current?.getTrack("row", 1);
    if (row?.isCollapsed()) {
      row.expand();
    } else {
      row?.collapse();
    }
  };

  // <end>

  return (
    <Grid columns={2} gridRef={gridRef} rows={[{}, { collapsible: true }]}>
      <Cell row={0} column={0} onClick={resetLayout} />
      <Cell row={1} column={0} onClick={toggleBottomRow} />
    </Grid>
  );
}

// hidden
export { GridImperativeApi };
