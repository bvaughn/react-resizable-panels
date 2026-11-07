import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { type WorkspaceModel } from "react-resizable-panels";
import { html as CollapseButtonHTML } from "../../public/generated/examples/WorkspaceCollapseButton.json";
import { html as CollapsibleModelHTML } from "../../public/generated/examples/WorkspaceCollapsibleModel.json";
import { html as KeepWhenEmptyHTML } from "../../public/generated/examples/WorkspaceKeepWhenEmpty.json";
import { html as MaximizeTabsetHTML } from "../../public/generated/examples/WorkspaceMaximizeTabset.json";
import { html as MaxSizeModelHTML } from "../../public/generated/examples/WorkspaceMaxSizeModel.json";
import { html as TabsetDragHandleHTML } from "../../public/generated/examples/WorkspaceTabsetDragHandle.json";
import { Link } from "../components/Link";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { collapsibleModel } from "./examples/WorkspaceCollapsibleModel";
import { maxSizeModel } from "./examples/WorkspaceMaxSizeModel";
import { initialModel, type TabData } from "./examples/WorkspaceModel";

// The editor area stays when its last tab is closed (see "Empty tabsets")
const keepWhenEmptyModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        size: 30,
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
      },
      {
        type: "tabset",
        id: "editors",
        keepWhenEmpty: true,
        tabs: [
          { id: "counter", title: "Counter", data: { kind: "counter" } },
          { id: "notes", title: "Notes", data: { kind: "notes" } }
        ]
      }
    ]
  }
};

export default function WorkspaceManagingTabsetsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Managing tabsets" />
      <div>
        Tabsets are created and removed as tabs are opened, closed, and dragged
        (see <Link to="/examples/workspace/managing-tabs">managing tabs</Link>
        ), but they can also be kept when empty, moved, collapsed, and maximized
        as a whole.
      </div>
      <SectionHeader>Empty tabsets</SectionHeader>
      <div>
        By default, a tabset is removed when its last tab is closed or dragged
        away. A tabset with the <code>keepWhenEmpty</code> flag stays instead
        (e.g. an editor area that should remain as a drop target), showing the
        Workspace's <code>renderEmptyTabset</code> content, until it's closed
        with the <code>closeTabset</code> method or the{" "}
        <code>useParentTabset</code> hook's <code>close</code> function:
      </div>
      <Code html={KeepWhenEmptyHTML} />
      <div>
        In the workspace below, the tabset on the right has the{" "}
        <code>keepWhenEmpty</code> flag. Close its tabs (or drag them into the
        tabset on the left) and it stays, as a place to drop them again. Each
        tabset's close button (×) removes it, along with any tabs it still has.
      </div>
      <DemoWorkspace
        canCloseTabset={() => true}
        className="h-80"
        defaultModel={keepWhenEmptyModel}
        showResetButton
      />
      <Callout>
        Closing a tabset also closes any tabs it contains. Like the rest of the
        imperative API, it isn't restricted by tabs' <code>disableClose</code>{" "}
        flags.
      </Callout>
      <SectionHeader>Moving tabsets</SectionHeader>
      <div>
        Users can drag a whole tabset by the empty space in its header (e.g.
        after its last tab). Dropping it onto the edge of another tabset moves
        it there; dropping it onto the center of another tabset (or into its
        list of tabs) moves its tabs into that tabset instead.
      </div>
      <div>
        A{" "}
        <Link to="/props/tabset-drag-handle">
          <code>TabsetDragHandle</code>
        </Link>{" "}
        (or any element with a <code>data-tabset-drag-handle</code> attribute)
        within a tabset's header replaces its empty space: once a header has a
        handle, only the handle drags the tabset.
      </div>
      <Code html={TabsetDragHandleHTML} />
      <DemoWorkspace
        className="h-80"
        defaultModel={initialModel}
        showDragHandles
        showResetButton
      />
      <div>
        Tabsets with the <code>keepWhenEmpty</code> flag can be moved, but their
        tabs can't be dropped into another tabset with them (which would leave
        the tabset behind, empty). Tabsets can't be dragged when they (or any of
        their tabs) have the <code>disableDrag</code> flag (see{" "}
        <Link to="/examples/workspace/restrictions">restrictions</Link>), when
        they're the only tabset, or while a tabset is maximized.
      </div>
      <Callout>
        The <code>moveTabset</code> method moves a tabset from outside of the
        workspace (e.g. a "Move to bottom" menu item); it accepts the same
        targets as <code>moveTab</code>.
      </Callout>
      <SectionHeader>Dropping at the edges of the workspace</SectionHeader>
      <div>
        Dropping a tab (or tabset) at the very edge of the workspace puts it
        beside all of the other tabsets, filling the workspace's height (or
        width), like a sidebar or a bottom panel in an IDE. It takes an equal
        share of the space, which the other tabsets beside it give up
        proportionally.
      </div>
      <div>
        The left, right, and bottom edges accept drops within a few pixels of
        the edges of the workspace's tabsets (further in, the edges of the
        tabsets themselves accept them), and anywhere within the padding of the
        workspace's root element. Since tab lists are usually along the top of
        the workspace, the top edge only accepts drops within the root element's
        padding; add top padding to the workspace to enable it.
      </div>
      <Callout>
        These targets have an <code>edge</code> rather than a{" "}
        <code>tabsetId</code> (e.g. <code>{'{ edge: "right" }'}</code>), and can
        be turned off with{" "}
        <code>{'disableDrop={({ target }) => "edge" in target}'}</code>. The
        drop indicator has a <code>data-edge</code> attribute (rather than{" "}
        <code>data-region</code>) while it shows one.
      </Callout>
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
        from within a tabset (e.g. a button in its toolbar) with the{" "}
        <code>useParentTabset</code> hook:
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
      <SectionHeader>Maximizing tabsets</SectionHeader>
      <div>
        A maximized tabset covers the rest of the workspace until it's restored.
        The <code>maximizeTabset</code> and <code>restoreTabset</code> methods
        do this from outside of the workspace, and the{" "}
        <code>useParentTabset</code> hook from within a tabset (e.g. a button in
        its toolbar):
      </div>
      <Code html={MaximizeTabsetHTML} />
      <div>
        Which tabset is maximized is part of the model, so it's saved and
        restored with the rest of the model. While a tabset is maximized, tabs
        can only be dragged within it.
      </div>
      <Callout>
        Changes made with the imperative API are reported by{" "}
        <code>onModelChanged</code> (with <code>isUserInteraction</code> set to{" "}
        <code>false</code>), so they're saved like any other change.
      </Callout>
    </Box>
  );
}
