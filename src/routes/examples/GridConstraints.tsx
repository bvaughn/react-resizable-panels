import { Cell, Grid } from "react-resizable-panels";

// <begin>

<Grid
  columns={[{ defaultSize: "25%", minSize: "10%" }, { minSize: "25%" }]}
  rows={[{ defaultSize: "25%", minSize: "25%" }, { minSize: "25%" }]}
>
  <Cell row={0} column={0} rowSpan={2}>
    left
  </Cell>
  <Cell row={0} column={1}>
    top
  </Cell>
  <Cell row={1} column={1}>
    bottom
  </Cell>
</Grid>;
