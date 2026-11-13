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
        The{" "}
        <Link to="/hooks/use-popout-windows">
          <code>usePopoutWindows</code>
        </Link>{" "}
        hook opens tabs in popout windows, each with its own Workspace. Its{" "}
        <code>open</code> function opens a window for a model (e.g. from a
        button in a tabset's toolbar that pops out the tabset), and its{" "}
        <code>render</code> function renders a Workspace into each window. Give
        the popouts' Workspaces the same <code>dragGroup</code> as the main one
        so tabs can be dragged between windows:
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
        Use the "Open in new window" button in a tabset's toolbar below to move
        the tabset to a new window, then drag tabs between this window and the
        popout windows.
      </div>
      <PopoutWindowsDemo />
      <Callout intent="warning">
        Browsers block popup windows that aren't opened in response to user
        input (e.g. a click), and <code>window.open</code> returns{" "}
        <code>null</code> when that happens; <code>open</code> returns{" "}
        <code>false</code> then, so the tab can be kept where it was.
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
