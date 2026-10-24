// <begin>

import { Cell, Grid, useGridRef } from "react-resizable-panels";

function ExampleComponent() {
  const ref = useGridRef();

  const maximizeTopLeftCell = () => {
    ref.current?.getTrackById("column", "left").resize("75%");
    ref.current?.getTrackById("row", "top").resize("75%");
  };

  return (
    <Grid
      columns={[{ id: "left" }, { id: "right" }]}
      gridRef={ref}
      rows={[{ id: "top" }, { id: "bottom" }]}
    >
      <Cell row={0} column={0}>
        <button onClick={maximizeTopLeftCell}>maximize</button>
      </Cell>
      {/* Other cells... */}
    </Grid>
  );
}

// <end>

export { ExampleComponent };
