// <begin>

import {
  Cell,
  Grid,
  type GridImperativeHandle,
  useGridCallbackRef
} from "react-resizable-panels";

function ExampleComponent() {
  // gridRef can safely be shared with other components, context, and hooks
  // It can also be used as a dependency to effects
  const [gridRef, setGridRef] = useGridCallbackRef();

  return (
    <Grid
      columns={[{ id: "left" }, { id: "right" }]}
      gridRef={setGridRef}
      rows={[{ id: "top" }, { id: "bottom" }]}
    >
      <Cell row={0} column={0}>
        <MaximizeButton grid={gridRef} />
      </Cell>
      {/* Other cells... */}
    </Grid>
  );
}

function MaximizeButton({ grid }: { grid: GridImperativeHandle | null }) {
  const maximize = () => {
    grid?.getTrackById("column", "left").resize("75%");
    grid?.getTrackById("row", "top").resize("75%");
  };

  return <button onClick={maximize}>maximize</button>;
}

// <end>

export { ExampleComponent };
