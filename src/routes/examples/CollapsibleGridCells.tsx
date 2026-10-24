import { Cell, Grid, Gridline } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Grid
  columns={[
    // Columns collapse to 25 pixels
    { collapsedSize: 25, collapsible: true, minSize: 100 },
    { collapsedSize: 25, collapsible: true, minSize: 100 }
  ]}
  rows={[
    // Rows collapse all the way
    { collapsible: true, minSize: 50 },
    { collapsible: true, minSize: 50 }
  ]}
>
  <Cell row={0} column={0}>A</Cell>
  <Cell row={0} column={1}>B</Cell>
  <Cell row={1} column={0}>C</Cell>
  <Cell row={1} column={1}>D</Cell>

  <Gridline type="column" column={1} />
</Grid>
