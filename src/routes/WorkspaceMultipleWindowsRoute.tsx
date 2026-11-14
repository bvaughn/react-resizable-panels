import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as DragSourceInfoHTML } from "../../public/generated/examples/WorkspaceDragSourceInfo.json";
import { Link } from "../components/Link";

export default function WorkspaceMultipleWindowsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Multiple windows" />
      <div>
        Tabs (and tabsets) don't have to stay in the window they started in. A
        Workspace can be rendered into a{" "}
        <Link to="/examples/workspace/multiple-windows/popout-windows">
          popout window opened by your app
        </Link>{" "}
        and tabs can be dragged{" "}
        <Link to="/examples/workspace/multiple-windows/copies-of-your-app">
          between workspaces in different windows
        </Link>
        . This functionality is enabled using the <code>dragGroup</code> prop.
      </div>
      <SectionHeader>Drag groups</SectionHeader>
      <div>
        Workspaces with the same <code>dragGroup</code> prop can drag tabs (and
        tabsets) to each other. A tab dropped into another workspace keeps the
        same id and data and both workspaces report the change to{" "}
        <code>onModelChanged</code> with the reason <code>"transfer"</code>.
      </div>
      <div>
        Tab ids must be unique within the group. A tab can't be dropped into a
        workspace that already has a tab with its id. The{" "}
        <code>disableDrop</code> function will receive{" "}
        <code>source: "external"</code> for tabs dragged from other workspaces.
      </div>
      <div>
        Pointer events don't span window, so mouse drags use native HTML drag
        and drop when <code>dragGroup</code> is set. (Touch and pen drags still
        use pointer events and stay within their window.)
      </div>
      <SectionHeader>Where tabs come from</SectionHeader>
      <div>
        The <code>dragSourceInfo</code> prop is sent with the tabs dragged from
        a workspace, so the workspace they're dropped into can tell where they
        came from: <code>disableDrop</code> receives it as{" "}
        <code>sourceInfo</code> (along with the <code>sourceWorkspaceId</code>
        ), and so does <code>onModelChanged</code> for the{" "}
        <code>"transfer"</code> (and <code>"copy"</code>) changes it reports.
        For example, a workspace can only accept tabs from other "reports"
        workspaces, notify the user when a tab comes from an older version of
        the app, and migrate that tab's data when it's rendered:
      </div>
      <Code html={DragSourceInfoHTML} />
      <Callout>
        Like tab data, <code>dragSourceInfo</code> is sent to other copies of
        your app with the structured clone algorithm, so it must be cloneable.
      </Callout>
      <SectionHeader>Tab content in other windows</SectionHeader>
      <div>
        Unlike tabs moved within a workspace, a tab that's dropped into another
        workspace (or opened in a popout window) will be rendered inside of the
        new Workspace. State that should survive the move belongs in the tab's{" "}
        <code>data</code> then rather than component state.
      </div>
      <Callout>
        The workspace a tab is dropped into renders it with its own{" "}
        <code>renderTab</code> and <code>renderTabContent</code> props, so
        workspaces in a group should be able to render each other's tabs.
      </Callout>
    </Box>
  );
}
