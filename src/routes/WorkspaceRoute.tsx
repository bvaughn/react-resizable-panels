import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
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
      <SectionHeader>The model</SectionHeader>
      <div>
        Workspaces are uncontrolled. Their arrangement of tabsets and tabs is
        described by a serializable model: pass the initial model with the{" "}
        <code>defaultModel</code> prop, render each tab's content with{" "}
        <code>renderTabContent</code>, and observe changes with the{" "}
        <code>onModelChanged</code> callback.
      </div>
      <Code html={BasicsHTML} />
      <div>
        The model is a tree. Splits lay out their children side by side or
        stacked, and tabsets show one tab at a time. Each tab has an id (unique
        within the workspace) and <code>data</code> for the application, e.g.
        what the tab shows. This is the model for the workspace above:
      </div>
      <Code html={ModelHTML} />
      <div>
        Sizes are percentages of the parent split, and siblings without a size
        share the rest; see{" "}
        <Link to="/examples/workspace/sizing">sizing tabsets</Link> for other
        units and for minimum and maximum sizes (like the{" "}
        <code>tabsetMinWidth</code> and <code>tabsetMinHeight</code> props
        above).
      </div>
      <SectionHeader>Changes</SectionHeader>
      <div>
        <code>onModelChanged</code> is called with the new model after each
        change, along with a description of it: its <code>reason</code> (e.g.{" "}
        <code>"move"</code>, <code>"close"</code>, or <code>"resize"</code>),
        and whether the user made it (<code>isUserInteraction</code>). Saving
        the model from this callback is how{" "}
        <Link to="/examples/workspace/saving-layouts">layouts are saved</Link>.
      </div>
      <div>
        The application can change the model too, e.g. to open a tab when a file
        is selected in a tree. The workspace's{" "}
        <Link to="/imperative-api/workspace">imperative API</Link> (from{" "}
        <Link to="/hooks/use-workspace-ref">
          <code>useWorkspaceRef</code>
        </Link>
        ) adds, moves, and closes tabs and tabsets, and components within a tab
        or tabset can do the same with hooks like{" "}
        <Link to="/hooks/use-parent-tab">
          <code>useParentTab</code>
        </Link>{" "}
        (see <Link to="/examples/workspace/tab-content">tab content</Link>).
      </div>
      <Callout>
        Changes made with the imperative API are reported to{" "}
        <code>onModelChanged</code> too (with <code>isUserInteraction</code> set
        to <code>false</code>), so they're saved like any other change. They
        aren't limited by{" "}
        <Link to="/examples/workspace/restrictions">restrictions</Link>, which
        only apply to the user.
      </Callout>
      <SectionHeader>Next steps</SectionHeader>
      <div>
        These guides build on each other, from the essentials to more advanced
        features:
      </div>
      <ul className="list-disc pl-6">
        <li>
          <Link to="/examples/workspace/saving-layouts">Saving layouts</Link>{" "}
          and rendering{" "}
          <Link to="/examples/workspace/tab-content">tab content</Link>
        </li>
        <li>
          <Link to="/examples/workspace/opening-and-closing-tabs">
            Opening and closing tabs
          </Link>
          , <Link to="/examples/workspace/drag-and-drop">drag and drop</Link>,
          and <Link to="/examples/workspace/restrictions">restrictions</Link>
        </li>
        <li>
          <Link to="/examples/workspace/sizing">Sizing</Link>,{" "}
          <Link to="/examples/workspace/collapsing-and-maximizing">
            collapsing, and maximizing
          </Link>{" "}
          tabsets, and{" "}
          <Link to="/examples/workspace/floating-tabsets">floating</Link> them
          above the layout
        </li>
        <li>
          Customizing how tabsets look and behave:{" "}
          <Link to="/examples/workspace/custom-tabsets">custom tabsets</Link>,{" "}
          <Link to="/examples/workspace/tab-placement">tab placement</Link>,{" "}
          <Link to="/examples/workspace/styling">styling</Link>, and{" "}
          <Link to="/examples/workspace/keyboard-and-accessibility">
            keyboard and accessibility
          </Link>
        </li>
        <li>
          <Link to="/examples/workspace/multiple-windows">
            Multiple windows
          </Link>{" "}
          and{" "}
          <Link to="/examples/workspace/server-rendering">
            server rendering
          </Link>
        </li>
      </ul>
    </Box>
  );
}
