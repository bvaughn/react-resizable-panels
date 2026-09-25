import { Box, Code, ExternalLink, Header } from "react-lib-tools";
import { html as ConstraintsHTML } from "../../public/generated/examples/GridConstraints.json";
import { Cell } from "../components/styled-panels/Cell";
import { Grid } from "../components/styled-panels/Grid";

export default function GridConstraintsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Grids" title="Min/max sizes" />
      <div>
        Columns and rows support the same size constraints as panels, although
        they are declared on the grid rather than on individual cells because
        cells can span multiple rows or columns.
      </div>
      <Code html={ConstraintsHTML} />
      <Grid
        className="h-60!"
        columns={[{ defaultSize: "25%", minSize: "10%" }, { minSize: "25%" }]}
        rows={[{ defaultSize: "25%", minSize: "25%" }, { minSize: "25%" }]}
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
        As with panels, sizes can be specified using the following{" "}
        <ExternalLink href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units">
          CSS units
        </ExternalLink>
        :
      </div>
      <ul className="pl-8">
        <li className="list-disc">Pixels</li>
        <li className="list-disc">Percentages</li>
        <li className="list-disc">Font sizes (em, rem)</li>
        <li className="list-disc">Viewport sizes (vh, vw)</li>
      </ul>
    </Box>
  );
}
