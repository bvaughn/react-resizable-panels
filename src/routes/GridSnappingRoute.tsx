import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as GridSnapBehaviorOnReleaseHTML } from "../../public/generated/examples/GridSnapBehaviorOnRelease.json";
import { html as GridSnapSizesHTML } from "../../public/generated/examples/GridSnapSizes.json";
import { Link } from "../components/Link";
import { Cell } from "../components/styled-panels/Cell";
import { Grid } from "../components/styled-panels/Grid";

export default function GridSnappingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Grid" title="Snapping" />
      <div>
        Columns and rows support the same{" "}
        <Link to="/examples/snap-sizes">snap sizes</Link> as panels. Dragging a
        track boundary (or the point where two boundaries meet) snaps each track
        to its nearest snap size.
      </div>
      <Code html={GridSnapSizesHTML} />
      <Grid
        showSizes
        className="h-60!"
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
      </Grid>
      <div>
        As with groups, <code>snapBehavior="on-release"</code> lets track
        boundaries move freely and then snap once they are released.
      </div>
      <Code html={GridSnapBehaviorOnReleaseHTML} />
      <Grid
        showSizes
        className="h-60!"
        columns={[{ snapSizes: ["25%", "50%", "75%"] }, {}]}
        rows={[{ snapSizes: ["25%", "50%", "75%"] }, {}]}
        snapBehavior="on-release"
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
      </Grid>
      <Callout intent="primary">
        Arrow keys move a focused <Link to="/examples/gridlines">gridline</Link>{" "}
        to the next snap size.
      </Callout>
    </Box>
  );
}
