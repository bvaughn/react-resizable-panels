import { Cell, Grid, GridSeparator } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Grid columns={2} rows={2}>
  <Cell row={0} column={0}>A</Cell>
  <Cell row={0} column={1}>B</Cell>
  <Cell row={1} column={0}>C</Cell>
  <Cell row={1} column={1}>D</Cell>

  {/* Between columns 0 and 1; spans all rows */}
  <GridSeparator column={1} />

  {/* Between rows 0 and 1; spans all columns */}
  <GridSeparator row={1} />
</Grid>
