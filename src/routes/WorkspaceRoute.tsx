import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as BasicsHTML } from "../../public/generated/examples/WorkspaceBasics.json";
import { html as ModelHTML } from "../../public/generated/examples/WorkspaceModel.json";
import { WorkspaceDemo } from "../components/workspace/WorkspaceDemo";
import { Link } from "../components/Link";

export default function WorkspaceRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="The basics" />
      <div>
        A <code>Workspace</code> arranges tabsets, like an IDE's editor groups.
        Users can rearrange them by dragging tabs between tabsets, within a
        tabset's list of tabs, or onto the edge of a tabset to split it. Tabsets
        can also be resized and maximized.
      </div>
      <WorkspaceDemo defaultSeparators />
      <Callout intent="success">
        Tab content is never remounted when a tab is moved, so it keeps its
        state. Try incrementing the counter above and then dragging its tab
        somewhere else.
      </Callout>
      <div>
        Workspaces are uncontrolled. The layout is described by a serializable
        model and can be observed using the <code>onModelChanged</code>{" "}
        callback.
      </div>
      <Code html={BasicsHTML} />
      <div>
        Splits lay out their children side by side or stacked, and tabsets show
        one tab at a time. Sizes are percentages of the parent split; siblings
        without a size share the remaining space. Initial sizes can also be
        strings with units (e.g. <code>"250px"</code>), but they're converted to
        percentages when the user resizes the split, and they scale with the
        workspace when it's resized. This is the model for the workspace above:
      </div>
      <Code html={ModelHTML} />
      <div>
        The <code>tabsetMinWidth</code> and <code>tabsetMinHeight</code> props
        above set a minimum size for the content of every tabset (not including
        its tabs); a tabset can override them with the <code>minWidth</code> and{" "}
        <code>minHeight</code> fields of its model node.
      </div>
      <div>
        Tabs can also be opened, selected, closed, and rearranged by the
        application (see{" "}
        <Link to="/examples/workspace/managing-tabs">managing tabs</Link>). Like
        the rest of the library, workspaces are unstyled; see{" "}
        <Link to="/examples/workspace/custom-tabsets">custom tabsets</Link> and{" "}
        <Link to="/examples/workspace/styling">styling</Link> for how to render
        and style tabsets.
      </div>
      <div>
        The tabsets above are resized by dragging the space between them; see{" "}
        <Link to="/examples/workspace/separators">
          separators and accessibility
        </Link>{" "}
        for how to render visible separators, and how workspaces can be used
        with the keyboard.
      </div>
    </Box>
  );
}
