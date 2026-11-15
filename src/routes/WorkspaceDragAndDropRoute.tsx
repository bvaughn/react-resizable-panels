import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as TabsetDragHandleHTML } from "../../public/generated/examples/WorkspaceTabsetDragHandle.json";
import { Link } from "../components/Link";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { initialModel } from "./examples/WorkspaceModel";

export default function WorkspaceDragAndDropRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Drag and drop" />
      <div>
        Users rearrange a workspace by dragging tabs, and whole tabsets, and
        dropping them where they should go. While something is dragged, an
        element that follows the pointer previews it, and a drop indicator shows
        where it would be dropped. Pressing Escape cancels the drag.
      </div>
      <SectionHeader>Drop targets</SectionHeader>
      <div>Where a tab is dropped decides what happens to it:</div>
      <ul className="list-disc pl-6">
        <li>
          Into a tabset's list of tabs: the tab is added at that position.
        </li>
        <li>
          Onto a tabset's content: near one of its edges, the tabset is split
          and the tab gets a new tabset on that side; in the center, the tab is
          added to the tabset.
        </li>
        <li>
          At an edge of the workspace: the tab gets a new tabset beside all of
          the others (see{" "}
          <Link
            anchor="dropping-at-the-edges-of-the-workspace"
            to="/examples/workspace/drag-and-drop"
          >
            below
          </Link>
          ).
        </li>
      </ul>
      <div>
        Each target is described by an object: an <code>index</code> within a
        tabset's list (<code>{"{ index, tabsetId }"}</code>), a{" "}
        <code>region</code> of a tabset's content (
        <code>{'{ region: "left", tabsetId }'}</code>, or <code>"center"</code>
        ), or an <code>edge</code> of the workspace (
        <code>{'{ edge: "bottom" }'}</code>). The same objects are passed to the{" "}
        <code>disableDrop</code> prop (see{" "}
        <Link to="/examples/workspace/restrictions">restrictions</Link>) and
        accepted by the <code>moveTab</code>, <code>moveTabset</code>, and{" "}
        <code>addTab</code> methods of the{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>.
      </div>
      <Callout>
        Collapsed tabsets only accept drops into their lists of tabs, which
        expands them (see{" "}
        <Link to="/examples/workspace/collapsing-and-maximizing">
          collapsing tabsets
        </Link>
        ). Floating tabsets can't be split, so tabs dropped anywhere on one are
        added to it. While a tabset is maximized, tabs can only be dropped
        within it (or within floating tabsets, which are shown above it).
      </Callout>
      <div>
        Moves are reported to <code>onModelChanged</code> with the{" "}
        <code>"move"</code> reason. Tabs can also be{" "}
        <Link to="/examples/workspace/drag-and-drop/dragging-tabs-in">
          dragged in
        </Link>{" "}
        from outside of the workspace,{" "}
        <Link to="/examples/workspace/drag-and-drop/copying-tabs">copied</Link>{" "}
        rather than moved, and dragged between workspaces in{" "}
        <Link to="/examples/workspace/multiple-windows">different windows</Link>
        .
      </div>
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
        Tabsets with the <code>keepWhenEmpty</code> flag (see{" "}
        <Link
          anchor="empty-tabsets"
          to="/examples/workspace/opening-and-closing-tabs"
        >
          empty tabsets
        </Link>
        ) can be moved, but their tabs can't be dropped into another tabset with
        them (which would leave the tabset behind, empty). Tabsets can't be
        dragged when they (or any of their tabs) have the{" "}
        <code>disableDrag</code> flag (see{" "}
        <Link to="/examples/workspace/restrictions">restrictions</Link>), when
        they're the only tabset, or while a tabset is maximized.
      </div>
      <Callout>
        The <code>moveTabset</code> method moves a tabset from application code
        (e.g. a "Move to bottom" menu item); it accepts the same targets as{" "}
        <code>moveTab</code>.
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
      <div>
        Tabs dropped at an edge that a collapsed tabset lines (e.g. a sidebar
        collapsed to a strip of tabs) are added to that tabset instead, as if
        they were dropped onto its tab list, which expands it. Those targets
        have an <code>index</code> and a <code>tabsetId</code>, like any other
        drop into a tab list.
      </div>
      <Callout>
        Edge targets can be turned off with{" "}
        <code>{'disableDrop={({ target }) => "edge" in target}'}</code> (which
        doesn't affect drops into collapsed tabsets along an edge).
      </Callout>
      <SectionHeader>Drag previews and drop indicators</SectionHeader>
      <div>
        The element that follows the pointer shows the dragged tab's title by
        default. The <code>renderDragPreview</code> prop renders its content for
        a tab, and <code>renderTabsetDragPreview</code> for a tabset; both are
        told whether the drop would add a{" "}
        <Link to="/examples/workspace/drag-and-drop/copying-tabs">copy</Link> (
        <code>isCopy</code>).
      </div>
      <div>
        The drop indicator is an element with a <code>data-drop-indicator</code>{" "}
        attribute, positioned over the region or edge a tab would be dropped
        into (with a <code>data-region</code> or <code>data-edge</code>{" "}
        attribute). For a drop into a list of tabs, the tab it would be dropped
        before has a <code>data-drop-before</code> attribute instead (or the
        last tab has a <code>data-drop-after</code> attribute, for a drop at the
        end). Both the drop indicator and the drag preview have a{" "}
        <code>data-drag-copy</code> attribute while the drop would add a copy.
        The drag preview also has <code>data-drag-preview</code> and{" "}
        <code>data-drag-type</code> (<code>"tab"</code> or <code>"tabset"</code>
        ) attributes. The tab or tabset being dragged has a{" "}
        <code>data-tab-dragging</code> or <code>data-tabset-dragging</code>{" "}
        attribute (see <Link to="/examples/workspace/styling">styling</Link>).
      </div>
    </Box>
  );
}
