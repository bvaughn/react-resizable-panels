import { Box, Callout, Code, Header, Link } from "react-lib-tools";
import { html as CollapsibleGridCellsHTML } from "../../public/generated/examples/CollapsibleGridCells.json";
import { Cell } from "../components/styled-panels/Cell";
import { Grid } from "../components/styled-panels/Grid";
import { Gridline } from "../components/styled-panels/Gridline";

export default function CollapsibleGridCellsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Grids" title="Collapsible grid cells" />
      <div>
        As with <Link to="/examples/collapsible-panels">panels</Link>, a grid's
        cells can be configured to be collapsible past a certain threshold.
      </div>
      <Code html={CollapsibleGridCellsHTML} />
      <Grid
        className="h-60!"
        columns={[
          { collapsedSize: 25, collapsible: true, minSize: 100 },
          { collapsedSize: 25, collapsible: true, minSize: 100 }
        ]}
        rows={[
          { collapsible: true, minSize: 50 },
          { collapsible: true, minSize: 50 }
        ]}
      >
        <Cell row={0} column={0}>
          A
        </Cell>
        <Cell row={0} column={1}>
          B
        </Cell>
        <Cell row={1} column={0}>
          C
        </Cell>
        <Cell row={1} column={1}>
          D
        </Cell>
        <Gridline type="column" column={1} />
      </Grid>
      <Callout>
        In the example above, the columns collapse to a width of 25 pixels
        (their <code>collapsedSize</code>) and the rows collapse all the way.
        Only the column boundary has a gridline; the row boundary can still be
        resized by dragging the space between cells.
      </Callout>
    </Box>
  );
}
