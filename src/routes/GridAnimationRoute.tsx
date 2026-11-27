import { Box, Callout, Code, Header } from "react-lib-tools";
import { useGridRef } from "react-resizable-panels";
import { html as GridAnimatedLayoutChangesHTML } from "../../public/generated/examples/GridAnimatedLayoutChanges.json";
import { DemoButton } from "../components/DemoButton";
import { Link } from "../components/Link";
import { SnapRuler } from "../components/SnapRuler";
import { Cell } from "../components/styled-panels/Cell";
import { Grid } from "../components/styled-panels/Grid";

const SNAP_SIZES = [25, 50, 75];

export default function GridAnimationRoute() {
  const gridRef = useGridRef();

  return (
    <Box direction="column" gap={4}>
      <Header section="Grid" title="Animation" />
      <div>
        Like <Link to="/examples/animation">groups</Link>, grids can animate
        layout changes with a CSS transition. A grid is sized using the{" "}
        <code>grid-template-columns</code> and <code>grid-template-rows</code>{" "}
        styles, and has a <code>data-resizing</code> attribute while one of its
        track boundaries is being dragged (and until its initial layout has been
        applied).
      </div>
      <Code html={GridAnimatedLayoutChangesHTML} />
      <div>
        Every other layout change is animated, including{" "}
        <Link to="/examples/grid-snapping">snapping</Link> once a boundary is
        released, the keyboard, and the{" "}
        <Link to="/imperative-api/grid">imperative API</Link>:
      </div>
      <SnapRuler horizontal={SNAP_SIZES} vertical={SNAP_SIZES}>
        <Grid
          // "!" is needed to override the site's global "transition: none"
          className="h-60! motion-safe:[&:not([data-resizing])]:[transition:grid-template-columns_200ms_ease-out,grid-template-rows_200ms_ease-out]!"
          columns={[
            {
              collapsible: true,
              minSize: "10%",
              snapSizes: ["25%", "50%", "75%"]
            },
            {}
          ]}
          gridRef={gridRef}
          rows={[{ snapSizes: ["25%", "50%", "75%"] }, {}]}
          showSizes
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
      </SnapRuler>
      <div className="flex flex-wrap gap-2">
        <DemoButton
          onClick={() =>
            gridRef.current?.getTrackByIndex("column", 0).collapse()
          }
        >
          Collapse left
        </DemoButton>
        <DemoButton
          onClick={() => gridRef.current?.getTrackByIndex("column", 0).expand()}
        >
          Expand left
        </DemoButton>
        <DemoButton
          onClick={() =>
            gridRef.current?.setLayout({
              columns: { "0": 75, "1": 25 },
              rows: { "0": 25, "1": 75 }
            })
          }
        >
          75% × 25%
        </DemoButton>
        <DemoButton
          onClick={() =>
            gridRef.current?.setLayout({
              columns: { "0": 50, "1": 50 },
              rows: { "0": 50, "1": 50 }
            })
          }
        >
          Reset layout
        </DemoButton>
      </div>
      <Callout intent="primary">
        Browsers can only animate between grid templates with the same tracks,
        so adding or removing columns and rows isn't animated.
      </Callout>
      <Callout>
        As with groups, layout change callbacks report the final sizes right
        away. Tracks whose sizes depend on the grid's size (e.g. those with snap
        sizes) also animate when the grid is resized, so they may lag behind
        while (for example) the window is being resized.
      </Callout>
    </Box>
  );
}
