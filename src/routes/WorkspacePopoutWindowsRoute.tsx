import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as DragGroupHTML } from "../../public/generated/examples/WorkspaceDragGroup.json";
import { html as PopoutWindowsHTML } from "../../public/generated/examples/WorkspacePopoutWindows.json";
import { Link } from "../components/Link";
import { PopoutWindowsDemo } from "../components/workspace/PopoutWindowsDemo";

export default function WorkspacePopoutWindowsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Popout windows" />
      <div>
        When a tab or tabset is dropped outside of the window it was rendered
        in, the Workspace calls its <code>onTearOff</code> prop with the tab and
        a detached model (containing just that tab) along with where the pointer
        was released and the size of the tabset it was dragged from.
      </div>
      <ul className="pl-8">
        <li className="list-disc">
          Returning <code>true</code> removes the tab from the workspace
          (reported to <code>onModelChanged</code> with the{" "}
          <code>"tear-off"</code> reason)
        </li>
        <li className="list-disc">
          Returning <code>false</code> leaves it where it was.
        </li>
      </ul>
      <Callout>
        Tabsets with the <code>keepWhenEmpty</code> flag can't be torn off, but
        their tabs can.
      </Callout>
      <div>
        The{" "}
        <Link to="/hooks/use-popout-windows">
          <code>usePopoutWindows</code>
        </Link>{" "}
        hook handles the rest: its <code>onTearOff</code> function opens each
        torn-off tab in a popout window (positioned where the pointer was
        released), and its <code>render</code> function renders a Workspace into
        each window. Give the popouts' Workspaces the same{" "}
        <code>dragGroup</code> as the main one so tabs can be dragged between
        windows:
      </div>
      <Code html={PopoutWindowsHTML} />
      <ul className="pl-8">
        <li className="list-disc">
          The page's stylesheets are copied into each popout window, which
          starts out blank.
        </li>
        <li className="list-disc">
          When the user closes a popout window, its tabs are moved back to the
          main workspace (see the <code>onClose</code> option).
        </li>
        <li className="list-disc">
          A popout window is closed once its last tab is dragged out of it.
        </li>
        <li className="list-disc">
          Popout windows are closed along with the page that opened them (or the
          component that uses the hook), since it renders their content.
        </li>
      </ul>
      <div>
        Drag a tab (or a tabset) out of the window below and release it to open
        it in a new window. Tabs can also be dragged between this window and the
        popout windows. The "Open in new window" button in each tabset's toolbar
        opens its selected tab with the hook's <code>open</code> function, for
        browsers that block popups opened by those drags (see below).
      </div>
      <PopoutWindowsDemo />
      <Callout intent="warning">
        Browsers block popup windows that aren't opened in response to user
        input, and <code>window.open</code> returns <code>null</code> when that
        happens. The Workspace can't tell whether your popup opened, so{" "}
        <code>onTearOff</code> should check for <code>null</code> and return{" "}
        <code>false</code> to keep the tab (as <code>usePopoutWindows</code>{" "}
        does); returning <code>true</code> removes the tab even if nothing shows
        it. <code>onTearOff</code> is called while the pointer's release is
        handled, which browsers treat as user input, so this mostly affects
        drags between workspaces (see below).
      </Callout>
      <Callout>
        Some browsers (e.g. Safari) block popup windows opened at the end of a
        drag. Opening popups from a click instead (e.g. a button, like in the
        example above) works in every browser.
      </Callout>
      <SectionHeader>Dragging between popout windows</SectionHeader>
      <div>
        Workspaces with the same <code>dragGroup</code> prop can drag tabs (and
        tabsets) to each other, e.g. from a popout window back into the main
        window, or from one popout to another (see{" "}
        <Link to="/examples/workspace/multiple-windows">drag groups</Link> for
        how tabs move between workspaces).
      </div>
      <Code html={DragGroupHTML} />
      <SectionHeader>Drag previews</SectionHeader>
      <div>
        The <code>renderDragPreview</code> and{" "}
        <code>renderTabsetDragPreview</code> props are passed an{" "}
        <code>isTearOff</code> flag, which is <code>true</code> while releasing
        the pointer would tear off the tab (or tabset), e.g. to show "Open in a
        new window". The preview element also has a <code>data-tear-off</code>{" "}
        attribute then. The preview can only be shown within the window, so only
        the part of it near the edge of the window is visible.
      </div>
      <SectionHeader>Rendering into popout windows</SectionHeader>
      <div>
        To open popout windows without <code>usePopoutWindows</code>, elements
        in a popout window should be created by that window's own document (e.g.
        the container the Workspace is rendered into), so that they belong to
        that window. The Workspace and its tabsets read the globals they need
        (e.g. <code>ResizeObserver</code>) from the window their elements are
        in.
      </div>
    </Box>
  );
}
