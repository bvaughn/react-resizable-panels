import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as CollapseButtonHTML } from "../../public/generated/examples/WorkspaceCollapseButton.json";
import { html as CollapsibleModelHTML } from "../../public/generated/examples/WorkspaceCollapsibleModel.json";
import { html as MaximizeTabsetHTML } from "../../public/generated/examples/WorkspaceMaximizeTabset.json";
import { html as MaxSizeModelHTML } from "../../public/generated/examples/WorkspaceMaxSizeModel.json";
import { Link } from "../components/Link";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { collapsibleModel } from "./examples/WorkspaceCollapsibleModel";
import { maxSizeModel } from "./examples/WorkspaceMaxSizeModel";

export default function WorkspaceSizingTabsetsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Sizing tabsets" />
      <div>
        Tabsets are resized by dragging the separators between them (see{" "}
        <Link to="/examples/workspace/separators">separators</Link>), within
        their minimum sizes (see{" "}
        <Link to="/examples/workspace">the basics</Link>). They can also have
        maximum sizes, be collapsed to just their headers, and be maximized to
        cover the rest of the workspace.
      </div>
      <SectionHeader>Limiting tabset sizes</SectionHeader>
      <div>
        The <code>maxWidth</code> and <code>maxHeight</code> fields of a tabset
        limit how large it can be resized, e.g. a sidebar that can only grow so
        wide. Like <code>minWidth</code> and <code>minHeight</code>, they apply
        to the tabset's content area (not including its tabs), and must use
        absolute units (e.g. <code>"300px"</code> or <code>"20rem"</code>):
      </div>
      <Code html={MaxSizeModelHTML} />
      <div>
        The sidebar below can be resized between 150 and 300 pixels wide, but
        its tab can't be dragged or closed.
      </div>
      <DemoWorkspace
        className="h-80"
        defaultModel={maxSizeModel}
        defaultSeparators
        showResetButton
      />
      <Callout>
        A split always fills its space, so a maximum only applies if something
        else can take up the rest of it, e.g. another tabset in the same split
        without a maximum. Maximums are ignored (with a warning in development)
        if every tabset in a split has one, or if the tabset fills the
        workspace.
      </Callout>
      <SectionHeader>Collapsing tabsets</SectionHeader>
      <div>
        A tabset with the <code>collapsible</code> flag can be collapsed to just
        its header (e.g. a bottom panel or a sidebar). Like a{" "}
        <Link to="/examples/collapsible-panels">collapsible Panel</Link>, it
        collapses when a separator is dragged past its minimum size, and expands
        when the separator is dragged back. Clicking one of its tabs (or the
        empty space in its header) also expands it, as does dropping a tab into
        it from another tabset. Its <code>collapsed</code> flag is part of the
        model, and its <code>size</code> is the size it expands to:
      </div>
      <Code html={CollapsibleModelHTML} />
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
      <div>
        In the workspace below, the bottom tabset starts collapsed and the
        sidebar can be collapsed (with the − button in its toolbar, or by
        dragging the space beside it). While collapsed, a tabset's header runs
        along its split, so the sidebar collapses to a vertical strip.
      </div>
      <DemoWorkspace
        className="h-80"
        defaultModel={collapsibleModel}
        defaultSeparators
        showResetButton
      />
      <Callout>
        The only tabset in a workspace can't be collapsed, and neither can a
        tabset whose siblings are all collapsed (something has to fill the
        space). Collapsing a tabset doesn't unmount its content.
      </Callout>
      <Callout>
        Floating tabsets can always be collapsed, without the{" "}
        <code>collapsible</code> flag (see{" "}
        <Link
          anchor="collapsing-floating-tabsets"
          to="/examples/workspace/managing-tabsets/floating-tabsets"
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
        restored with the rest of the model. While a tabset is maximized, tabs
        can only be dragged within it (or within{" "}
        <Link to="/examples/workspace/managing-tabsets/floating-tabsets">
          floating tabsets
        </Link>
        , which are shown above it).
      </div>
    </Box>
  );
}
