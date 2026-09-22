import { Cell, Grid } from "react-resizable-panels";

// <begin>

/* prettier-ignore */
<Grid
  columns={[
    { id: "nav", defaultSize: "25%", minSize: 100, collapsible: true },
    { id: "main", minSize: "30%" }
  ]}
  rows={[
    { id: "content" },
    { id: "console", defaultSize: 100, minSize: 50 }
  ]}
>
  <Cell row={0} column={0} rowSpan={2}>nav</Cell>
  <Cell row={0} column={1}>main</Cell>
  <Cell row={1} column={1}>console</Cell>
</Grid>
