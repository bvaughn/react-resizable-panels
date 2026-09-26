import { Box, Code, Header } from "react-lib-tools";
import { html as LayoutHTML } from "../../public/generated/examples/GridLayout.json";
import { html as SpansHTML } from "../../public/generated/examples/GridSpans.json";
import { Cell } from "../components/styled-panels/Cell";
import { Grid } from "../components/styled-panels/Grid";

export default function GridBasicsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Grids" title="The basics" />
      <div>
        The <code>Grid</code> component arranges resizable <code>Cell</code>s in
        two dimensions. Columns are resized horizontally and rows are resized
        vertically. Dragging the point where a column boundary meets a row
        boundary resizes both at once.
      </div>
      <Code html={LayoutHTML} />
      <Grid className="h-60!" columns={2} rows={2}>
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
      </Grid>
      <div>
        Cells can span multiple columns (<code>columnSpan</code>) and/or rows (
        <code>rowSpan</code>). A boundary cannot be resized alongside of a cell
        that spans across it, although it can still be resized elsewhere.
      </div>
      <Code html={SpansHTML} />
      <Grid className="h-60!" columns={3} rows={3}>
        <Cell row={0} column={0} columnSpan={3}>
          header
        </Cell>
        <Cell row={1} column={0} rowSpan={2}>
          sidebar
        </Cell>
        <Cell row={1} column={1}>
          A
        </Cell>
        <Cell row={1} column={2}>
          B
        </Cell>
        <Cell row={2} column={1} columnSpan={2}>
          footer
        </Cell>
      </Grid>
    </Box>
  );
}
