import { Cell, Grid, Gridline } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Grid
  columns={[{ minSize: 25 }, { minSize: 25 }, { minSize: 25 }]}
  rows={[{ minSize: 25 }, { minSize: 25 }]}
>
  <Cell row={0} column={0}>A</Cell>
  <Cell row={0} column={1}>B</Cell>
  <Cell row={0} column={2}>C</Cell>
  <Cell row={1} column={0}>D</Cell>
  <Cell row={1} column={1}>E</Cell>
  <Cell row={1} column={2}>F</Cell>

  <Gridline type="column" column={1} />
  <Gridline type="column" column={2} />

  <Gridline type="row" row={1} />
</Grid>
