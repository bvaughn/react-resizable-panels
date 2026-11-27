import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as SnapSizesModelHTML } from "../../public/generated/examples/WorkspaceSnapSizesModel.json";
import { Link } from "../components/Link";
import { SnapRuler } from "../components/SnapRuler";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { snapSizesModel } from "./examples/WorkspaceSnapSizesModel";

const SNAP_SIZES = [25, 50, 75];

export default function WorkspaceSnappingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Snapping" />
      <div>
        The <code>snapWidths</code> and <code>snapHeights</code> fields of a
        tabset limit it to a set of sizes within horizontal and vertical splits.
        They use the same units as <code>size</code>. Dragging a separator snaps
        it to the nearest snap size, and arrow keys move a focused separator to
        the next one (see <Link to="/examples/snap-sizes">snapping panels</Link>
        ):
      </div>
      <Code html={SnapSizesModelHTML} />
      <div>
        The sidebar below can be resized to a quarter, half, or three quarters
        of the workspace's width.
      </div>
      <SnapRuler horizontal={SNAP_SIZES}>
        <DemoWorkspace
          className="h-80"
          defaultModel={snapSizesModel}
          showResetButton
        />
      </SnapRuler>
      <div>
        By default, separators snap while they are dragged. With{" "}
        <code>snapBehavior="on-release"</code>, they move freely and then snap
        once they are released.
      </div>
      <SnapRuler horizontal={SNAP_SIZES}>
        <DemoWorkspace
          className="h-80"
          defaultModel={snapSizesModel}
          showResetButton
          snapBehavior="on-release"
        />
      </SnapRuler>
      <Callout>
        Like{" "}
        <Link to="/examples/workspace/sizing/min-max-sizes">
          minimum and maximum sizes
        </Link>
        , a tabset is shown at its nearest snap size without changing its{" "}
        <code>size</code> (e.g. when the workspace is resized). The model is
        only updated when the user resizes the tabset. Snap sizes don't apply to
        floating tabsets.
      </Callout>
    </Box>
  );
}
