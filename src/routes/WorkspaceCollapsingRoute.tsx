import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as CollapseButtonHTML } from "../../public/generated/examples/WorkspaceCollapseButton.json";
import { html as CollapsibleModelHTML } from "../../public/generated/examples/WorkspaceCollapsibleModel.json";
import { html as MaximizeTabsetHTML } from "../../public/generated/examples/WorkspaceMaximizeTabset.json";
import { Link } from "../components/Link";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { collapsibleModel } from "./examples/WorkspaceCollapsibleModel";

export default function WorkspaceCollapsingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Collapsing and maximizing" />
      <div>
        Tabsets can be collapsed to just their headers, e.g. a sidebar or a
        bottom panel that's out of the way until it's needed, or maximized to
        cover the rest of the workspace.
      </div>
      <SectionHeader>Collapsing tabsets</SectionHeader>
      <div>
        A tabset with the <code>collapsible</code> flag can be collapsed. Like a{" "}
        <Link to="/examples/collapsible-panels">collapsible Panel</Link>, it
        collapses when a separator is dragged past its minimum size, and expands
        when the separator is dragged back. Its <code>collapsed</code> flag is
        part of the model, and its <code>size</code> is the size it expands to:
      </div>
      <Code html={CollapsibleModelHTML} />
      <div>
        Users can also collapse and expand tabsets by clicking their tabs:
      </div>
      <ul className="list-disc pl-6">
        <li>
          Clicking a tab of a collapsed tabset (or the empty space in its
          header) expands it, as does dropping a tab into it.
        </li>
        <li>
          Clicking the selected tab of an expanded tabset (or pressing Enter or
          Space on it) collapses it again, like the tool windows of an IDE.
        </li>
      </ul>
      <div>
        Tabsets can also be collapsed and expanded with the{" "}
        <code>collapseTabset</code> and <code>expandTabset</code> methods, or
        from within a tabset with the <code>useParentTabset</code> hook. The{" "}
        <Link to="/props/tabset-collapse-button">
          <code>TabsetCollapseButton</code>
        </Link>{" "}
        component does this from a tabset's toolbar, with the ARIA attributes a
        toggle needs (<code>aria-expanded</code> and <code>aria-controls</code>
        ); its <code>children</code>, <code>className</code>, <code>style</code>
        , and <code>title</code> can be functions of the tabset's state:
      </div>
      <Code html={CollapseButtonHTML} />
      <Callout>
        The only tabset in a workspace can't be collapsed, and neither can a
        tabset whose siblings are all collapsed (something has to fill the
        space). Collapsing a tabset doesn't unmount its content, unless the{" "}
        <Link anchor="performance" to="/examples/workspace/tab-content">
          <code>hiddenTabBehavior</code>
        </Link>{" "}
        prop says to. A <code>disabled</code> workspace doesn't collapse or
        expand tabsets when their tabs are clicked (see{" "}
        <Link to="/examples/workspace/restrictions">restrictions</Link>).
      </Callout>
      <SectionHeader>Sidebars and bottom panels</SectionHeader>
      <div>
        A collapsible tabset along an edge of the workspace works like the
        sidebars and bottom panels of an IDE. While collapsed, a tabset's header
        runs along its split, so a sidebar collapses to a vertical strip of tabs
        and a bottom panel to a horizontal one. Clicking a tab in the strip
        opens the panel to that tab, and clicking it again closes the panel.
        Tabs dropped at the edge of the workspace beside a strip are added to it
        (see{" "}
        <Link
          anchor="dropping-at-the-edges-of-the-workspace"
          to="/examples/workspace/drag-and-drop"
        >
          dropping at the edges of the workspace
        </Link>
        ).
      </div>
      <div>
        In the workspace below, the bottom tabset starts collapsed and the
        sidebar can be collapsed (with the − button in its toolbar, by clicking
        its selected tab, or by dragging the space beside it).
      </div>
      <DemoWorkspace
        className="h-80"
        defaultModel={collapsibleModel}
        defaultSeparators
        showResetButton
      />
      <Callout>
        Floating tabsets can always be collapsed, without the{" "}
        <code>collapsible</code> flag (see{" "}
        <Link
          anchor="collapsing-floating-tabsets"
          to="/examples/workspace/floating-tabsets"
        >
          collapsing floating tabsets
        </Link>
        ).
      </Callout>
      <SectionHeader>Maximizing tabsets</SectionHeader>
      <div>
        A maximized tabset covers the rest of the workspace until it's restored.
        The <code>maximizeTabset</code> and <code>restoreTabset</code> methods
        do this from outside of the workspace, and the{" "}
        <code>useParentTabset</code> hook from within a tabset. The{" "}
        <Link to="/props/tabset-maximize-button">
          <code>TabsetMaximizeButton</code>
        </Link>{" "}
        component does this from a tabset's toolbar (with{" "}
        <code>aria-pressed</code>):
      </div>
      <Code html={MaximizeTabsetHTML} />
      <div>
        Which tabset is maximized is part of the model, so it's saved and
        restored with the rest of the model. A collapsed tabset is shown
        expanded while it's maximized, and collapsed again when it's restored.
        While a tabset is maximized, tabs can only be dragged within it (or
        within{" "}
        <Link to="/examples/workspace/floating-tabsets">floating tabsets</Link>,
        which are shown above it).
      </div>
    </Box>
  );
}
