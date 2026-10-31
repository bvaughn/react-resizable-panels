import { Box, Callout, Code, Header } from "react-lib-tools";
import { useDefaultGridLayout } from "react-resizable-panels";
import { html as ExampleHTML } from "../../public/generated/examples/GridPersistentLayout.json";
import { Link } from "../components/Link";
import { Cell } from "../components/styled-panels/Cell";
import { Grid } from "../components/styled-panels/Grid";

export default function GridPersistentLayoutRoute() {
  const { defaultLayout, onLayoutChanged } = useDefaultGridLayout({
    id: "unique-grid-layout-id",
    storage: sessionStorage
  });

  return (
    <Box direction="column" gap={4}>
      <Header section="Grid" title="Persistent layouts" />
      <div>
        Grids can be configured to save and restore layouts (the sizes of their
        columns and rows) between page visits with the{" "}
        <Link to="/hooks/use-default-grid-layout">
          <code>useDefaultGridLayout</code>
        </Link>{" "}
        hook.
      </div>
      <div>
        Resize the grid below and then reload the page to see an example.
      </div>
      <Code html={ExampleHTML} />
      <Grid
        className="h-60!"
        columns={2}
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        rows={2}
        showSizes
      >
        <Cell column={0} row={0}>
          A
        </Cell>
        <Cell column={1} row={0}>
          B
        </Cell>
        <Cell column={0} row={1}>
          C
        </Cell>
        <Cell column={1} row={1}>
          D
        </Cell>
      </Grid>
      <Callout intent="warning">
        A saved layout is ignored for an axis if its track ids don't match the
        Grid's (e.g. after a column has been added or removed).
      </Callout>
      <div>
        The hook works the same way as{" "}
        <Link to="/hooks/use-default-layout">
          <code>useDefaultLayout</code>
        </Link>{" "}
        does for groups, so the same guidance applies to{" "}
        <Link to="/examples/persistent-layout/server-rendering">
          server rendering
        </Link>{" "}
        (e.g. saving layouts in a cookie instead of <code>localStorage</code>).
      </div>
    </Box>
  );
}
