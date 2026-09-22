import { Cell, Grid } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Grid columns={3} rows={3}>
  <Cell row={0} column={0} columnSpan={3}>header</Cell>
  <Cell row={1} column={0} rowSpan={2}>sidebar</Cell>
  <Cell row={1} column={1}>A</Cell>
  <Cell row={1} column={2}>B</Cell>
  <Cell row={2} column={1} columnSpan={2}>footer</Cell>
</Grid>
