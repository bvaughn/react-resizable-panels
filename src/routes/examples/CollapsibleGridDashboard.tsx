import { Cell, Grid, Gridline } from "react-resizable-panels";

declare function Activity(): null;
declare function Sidebar(): null;
declare function Stats(): null;

// <begin>

/* prettier-ignore */
<Grid
  columns={[
    // The sidebar collapses down to its icons
    { collapsedSize: 44, collapsible: true, defaultSize: 160, minSize: 120 },
    { minSize: "50%" }
  ]}
  rows={[
    { minSize: 100 },
    // The activity feed collapses all the way
    { collapsible: true, minSize: 80 }
  ]}
>
  <Cell row={0} column={0} rowSpan={2}><Sidebar /></Cell>
  <Cell row={0} column={1}><Stats /></Cell>
  <Cell row={1} column={1}><Activity /></Cell>

  <Gridline type="column" column={1} />
  <Gridline type="row" row={1} column={1} />
</Grid>
