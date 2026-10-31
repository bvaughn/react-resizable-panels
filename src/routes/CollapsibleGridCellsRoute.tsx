import { Box, Callout, Code, Header, Link } from "react-lib-tools";
import { html as DashboardHTML } from "../../public/generated/examples/CollapsibleGridDashboard.json";
import { Dashboard } from "../components/dashboard/Dashboard";

export default function CollapsibleGridCellsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Grid" title="Collapsible cells" />
      <div>
        As with <Link to="/examples/collapsible-panels">panels</Link>, a grid's
        columns and rows can be configured to collapse when they're resized
        below their minimum size. This works well for things like dashboards,
        where a sidebar can collapse down to just its icons and secondary
        content can be hidden entirely. Try dragging the gridlines below.
      </div>
      <Dashboard />
      <Code html={DashboardHTML} />
      <Callout>
        In the example above, the sidebar column collapses to a width of 44
        pixels (its <code>collapsedSize</code>), which leaves room for its
        icons, and the activity row collapses all the way. The row gridline only
        spans the second column because the sidebar spans both rows.
      </Callout>
    </Box>
  );
}
