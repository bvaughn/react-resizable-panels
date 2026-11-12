import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { type WorkspaceModel } from "react-resizable-panels";
import { html as KeepWhenEmptyHTML } from "../../public/generated/examples/WorkspaceKeepWhenEmpty.json";
import { html as TabsetDragHandleHTML } from "../../public/generated/examples/WorkspaceTabsetDragHandle.json";
import { Link } from "../components/Link";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
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
        ), but they can also be kept when empty and moved as a whole. They can
        also be{" "}
        <Link to="/examples/workspace/managing-tabsets/sizing-tabsets">
          limited in size, collapsed, and maximized
        </Link>
        , and{" "}
        <Link to="/examples/workspace/managing-tabsets/floating-tabsets">
          floated above the layout
        </Link>
        .
      </div>
      <SectionHeader>Empty tabsets</SectionHeader>
      <div>
        By default, a tabset is removed when its last tab is closed or dragged
        away. A tabset with the <code>keepWhenEmpty</code> flag stays instead
        (e.g. an editor area that should remain as a drop target), showing the
        Workspace's <code>renderEmptyTabset</code> content, until it's closed
        with the <code>closeTabset</code> method or the{" "}
        <code>useParentTabset</code> hook's <code>close</code> function. The
        example hides its close button in the only tabset in the workspace,
        since closing it would just close its tabs:
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
        showMaximizeButtons={false}
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
        handle, only the handle drags the tabset. The handle has a{" "}
        <code>data-disabled</code> attribute while the tabset can't be dragged
        (e.g. to hide or dim it).
      </div>
      <Code html={TabsetDragHandleHTML} />
      <DemoWorkspace
        className="h-80"
        defaultModel={initialModel}
        showDragHandles
        showMaximizeButtons={false}
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
        Each edge accepts drops within a few pixels of the edges of the
        workspace's tabsets (further in, the edges of the tabsets themselves
        accept them), and anywhere within the padding of the workspace's root
        element. Tabset headers aren't part of the edge, so that drops into
        their tab lists stay precise; an edge lined with tab lists (e.g. the top
        of the workspace, by default) only accepts drops within the root
        element's padding, so add padding there to enable it.
      </div>
      <Callout>
        These targets have an <code>edge</code> rather than a{" "}
        <code>tabsetId</code> (e.g. <code>{'{ edge: "right" }'}</code>), and can
        be turned off with{" "}
        <code>{'disableDrop={({ target }) => "edge" in target}'}</code>. The
        drop indicator has a <code>data-edge</code> attribute (rather than{" "}
        <code>data-region</code>) while it shows one.
      </Callout>
    </Box>
  );
}
