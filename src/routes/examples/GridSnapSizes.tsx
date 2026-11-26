import { Cell, Grid } from "react-resizable-panels";

// <begin>

<Grid
  columns={[{ snapSizes: ["25%", "50%", "75%"] }, {}]}
  rows={[{ snapSizes: ["25%", "50%", "75%"] }, {}]}
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
