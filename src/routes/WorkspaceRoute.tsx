import {
  Box,
  Callout,
  Code,
  ExternalLink,
  Header,
  SectionHeader
} from "react-lib-tools";
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
      <WorkspaceDemo />
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
      <SectionHeader>Keyboard and accessibility</SectionHeader>
      <div>
        Tabsets follow the{" "}
        <ExternalLink href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/">
          ARIA tabs pattern
        </ExternalLink>
        : each tab list has <code>role="tablist"</code>, each tab has{" "}
        <code>role="tab"</code>, and each tab's content has{" "}
        <code>role="tabpanel"</code>, linked to its tab. Only one tab per list
        (normally the selected one) is in the page's tab order; within a list,
        focus moves with the arrow keys:
      </div>
      <ul className="list-disc pl-6">
        <li>
          <kbd>←</kbd> and <kbd>→</kbd> (or <kbd>↑</kbd> and <kbd>↓</kbd> when
          tabs are placed on the left or right) move focus to the previous or
          next tab, wrapping at the ends
        </li>
        <li>
          <kbd>Home</kbd> and <kbd>End</kbd> move focus to the first or last tab
        </li>
        <li>
          <kbd>Enter</kbd> or <kbd>Space</kbd> selects the focused tab
        </li>
        <li>
          <kbd>Delete</kbd> or <kbd>Backspace</kbd> closes the focused tab
          (unless closing is disabled) and moves focus to its neighbor
        </li>
      </ul>
      <Callout>
        Tabs use manual activation: moving focus doesn't select a tab, so
        arrowing past a tab doesn't mount its content. Separators between
        tabsets can be resized with the keyboard like any other{" "}
        <Link to="/props/separator">
          <code>Separator</code>
        </Link>
        .
      </Callout>
    </Box>
  );
}
