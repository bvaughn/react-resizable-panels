import { Box, Code, Header } from "react-lib-tools";
import { html as GridlinesHTML } from "../../public/generated/examples/Gridlines.json";
import { html as GridlinesAdvancedHTML } from "../../public/generated/examples/GridlinesAdvanced.json";
import { Grid } from "../components/styled-panels/Grid";
import { Cell } from "../components/styled-panels/Cell";
import { Gridline } from "../components/styled-panels/Gridline";

export default function GridlinesRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Grids" title="Gridlines" />
      <div>
        Like <code>Separator</code>s within a <code>Group</code>,{" "}
        <code>Gridline</code>s are optional but recommended because they make
        the grid accessible to keyboard users.
      </div>
      <ul className="pl-8">
        <li className="list-disc">
          A {CODE_COLUMN} resizes the columns on either side of it and spans all
          rows
        </li>
        <li className="list-disc">
          A {CODE_ROW} resizes the rows on either side of it and spans all
          columns
        </li>
      </ul>
      <div>Where they intersect, dragging resizes both.</div>
      <Code html={GridlinesHTML} />
      <Grid
        className="h-60!"
        columns={[{ minSize: 25 }, { minSize: 25 }, { minSize: 25 }]}
        rows={[{ minSize: 25 }, { minSize: 25 }]}
      >
        <Cell row={0} column={0}>
          A
        </Cell>
        <Cell row={0} column={1}>
          B
        </Cell>
        <Cell row={0} column={2}>
          C
        </Cell>
        <Cell row={1} column={0}>
          D
        </Cell>
        <Cell row={1} column={1}>
          E
        </Cell>
        <Cell row={1} column={2}>
          F
        </Cell>

        <Gridline type="column" column={1} />
        <Gridline type="column" column={2} />

        <Gridline type="row" row={1} />
      </Grid>
      <div>
        By default, gridlines span to fill the available width/height. If a grid
        contains cells that span multiple rows or columns though, you may need
        to render multiple gridlines.
      </div>
      <Code html={GridlinesAdvancedHTML} />
      <Grid
        className="h-100!"
        columns={[{ minSize: 25 }, { minSize: 25 }, { minSize: 25 }]}
        rows={[{ minSize: 25 }, { minSize: 25 }]}
      >
        <Cell row={0} column={0}>
          A
        </Cell>
        <Cell row={1} column={0}>
          B
        </Cell>
        <Cell row={0} column={1} rowSpan={2}>
          C
        </Cell>
        <Cell row={0} column={2}>
          D
        </Cell>
        <Cell row={1} column={2}>
          E
        </Cell>

        <Gridline type="column" column={1} />
        <Gridline type="column" column={2} />

        <Gridline type="row" row={1} column={0} columnSpan={1} />
        <Gridline type="row" row={1} column={2} columnSpan={1} />
      </Grid>
      <div>
        Once a boundary contains a gridline, it can only be resized using
        gridlines; the parts of the boundary that aren't alongside of a gridline
        can't be dragged.
      </div>
    </Box>
  );
}

const CODE_COLUMN = (
  <code>
    <span className="tok-punctuation">&lt;</span>
    <span className="tok-typeName">Gridline </span>
    <span className="tok-propertyName">type</span>
    <span className="tok-operator">=</span>
    <span className="tok-string">"column" </span>
    <span className="tok-punctuation">/&gt;</span>
  </code>
);

const CODE_ROW = (
  <code>
    <span className="tok-punctuation">&lt;</span>
    <span className="tok-typeName">Gridline </span>
    <span className="tok-propertyName">type</span>
    <span className="tok-operator">=</span>
    <span className="tok-string">"row" </span>
    <span className="tok-punctuation">/&gt;</span>
  </code>
);
