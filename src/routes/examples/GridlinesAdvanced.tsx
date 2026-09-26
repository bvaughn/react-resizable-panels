import { Cell, Grid, Gridline } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Grid columns={3} rows={2}>
  <Cell row={0} column={0}>A</Cell>
  <Cell row={1} column={0}>B</Cell>
  <Cell row={0} column={1} rowSpan={2}>C</Cell>
  <Cell row={0} column={2}>D</Cell>
  <Cell row={1} column={2}>E</Cell>

  <Gridline type="column" column={1} />
  <Gridline type="column" column={2} />

  <Gridline type="row" row={1} column={0} columnSpan={1} />
  <Gridline type="row" row={1} column={2} columnSpan={1} />
</Grid>
