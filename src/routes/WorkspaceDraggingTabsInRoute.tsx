import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as AcceptExternalDropHTML } from "../../public/generated/examples/WorkspaceAcceptExternalDrop.json";
import { html as AcceptFileDropHTML } from "../../public/generated/examples/WorkspaceAcceptFileDrop.json";
import { html as ExternalDragHTML } from "../../public/generated/examples/WorkspaceExternalDrag.json";
import { Link } from "../components/Link";
import { ExternalDragDemo } from "../components/workspace/ExternalDragDemo";

export default function WorkspaceDraggingTabsInRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Dragging tabs in" />
      <div>
        Users can drag new tabs in from outside of the workspace (e.g. from a
        library of widgets), and drop them anywhere a tab could be dropped: into
        a tabset, beside one, or at an edge of the workspace. There are two ways
        to do this:
      </div>
      <ul className="list-disc ps-6 flex flex-col gap-1">
        <li>
          The <code>startExternalDrag</code> method of the{" "}
          <Link to="/imperative-api/workspace">imperative API</Link> starts a
          drag that works like dragging one of the workspace's own tabs,
          including with touch input.
        </li>
        <li>
          The <code>acceptExternalDrop</code> prop accepts drags that use the
          browser's drag and drop, e.g. elements with the <code>draggable</code>{" "}
          attribute, files, or drags from another application.
        </li>
      </ul>
      <div>
        Drag the widgets below into the workspace. "Counter" and "Notes" use{" "}
        <code>startExternalDrag</code>, and "About" uses the browser's drag and
        drop.
      </div>
      <ExternalDragDemo />
      <SectionHeader>Starting a drag</SectionHeader>
      <div>
        Call <code>startExternalDrag</code> from an element's{" "}
        <code>pointerdown</code> handler with the tab to add. The tab is dragged
        like the workspace's own tabs are, and added where it's dropped:
      </div>
      <Code html={ExternalDragHTML} />
      <div>
        The drag starts once the pointer moves, so clicking the element still
        works (e.g. to add the tab with <code>addTab</code>; see{" "}
        <Link to="/examples/workspace/managing-tabs">managing tabs</Link>), and
        the click that follows a drag is suppressed. Pressing Escape cancels the
        drag.
      </div>
      <div>
        <code>startExternalDrag</code> returns a promise that resolves with
        where the tab was dropped (<code>{"{ target }"}</code>), or{" "}
        <code>null</code> if it wasn't (e.g. it was dropped outside of the
        workspace, or the drag was canceled). The element that follows the
        pointer shows what the Workspace's <code>renderDragPreview</code> prop
        renders for the tab, unless a <code>preview</code> is passed.
      </div>
      <Callout>
        Set <code>touch-action: none</code> on the element, so that touch input
        drags it rather than scrolling the page. The element must be in the same
        document as the workspace; tabs dragged this way can't be dropped into a
        workspace in another window (see{" "}
        <Link to="/examples/workspace/multiple-windows">multiple windows</Link>
        ).
      </Callout>
      <SectionHeader>Accepting the browser's drag and drop</SectionHeader>
      <div>
        Browsers only let a drag's data be read when it's dropped, so the{" "}
        <code>acceptExternalDrop</code> prop has two parts: the data{" "}
        <code>types</code> that decide where the drop indicator is shown while
        the drag is over the workspace, and a <code>createTab</code> function
        that reads the data and creates the tab when it's dropped:
      </div>
      <Code html={AcceptExternalDropHTML} />
      <div>
        <code>createTab</code> can return <code>null</code> to reject the drop.
        Files dragged from the operating system have the <code>"Files"</code>{" "}
        type:
      </div>
      <Code html={AcceptFileDropHTML} />
      <Callout>
        Elements within tabs' content that accept a drag themselves (by
        canceling its <code>dragover</code> event) take precedence over the
        workspace. Drags of the workspace's own tabs (see the{" "}
        <code>dragGroup</code> prop) are never passed to <code>createTab</code>.
      </Callout>
      <SectionHeader>Restrictions</SectionHeader>
      <div>
        Tabs dragged in either way are checked by the <code>disableDrop</code>{" "}
        prop with the <code>"new"</code> source, and can't be dropped into a
        workspace that already has a tab (or tabset) with the same id, so give
        each new tab a unique id. Neither works while the workspace is{" "}
        <code>disabled</code>. Unlike the rest of the imperative API,{" "}
        <code>startExternalDrag</code> is restricted by these, since the user
        decides where the tab goes (see{" "}
        <Link to="/examples/workspace/restrictions">restrictions</Link>).
      </div>
      <Callout>
        A drag's data can't be read until it's dropped, so for drags that use
        the browser's drag and drop, <code>disableDrop</code> is only called
        when it's dropped (with the tab <code>createTab</code> returned); the
        drop indicator may be shown over a target that ends up rejecting it.
      </Callout>
      <div>
        New tabs are reported to <code>onModelChanged</code> with the{" "}
        <code>"add"</code> reason (and <code>isUserInteraction</code> set to{" "}
        <code>true</code>).
      </div>
    </Box>
  );
}
