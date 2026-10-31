import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as TabHooksHTML } from "../../public/generated/examples/WorkspaceTabHooks.json";
import { Link } from "../components/Link";

export default function WorkspaceTabContentRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Tab content" />
      <div>
        Components within a tab can use the{" "}
        <Link to="/hooks/use-parent-tab">
          <code>useParentTab</code>
        </Link>{" "}
        hook to close or select the tab, and{" "}
        <Link to="/hooks/use-parent-tab-state">
          <code>useParentTabState</code>
        </Link>{" "}
        to re-render when it's selected or shown. The{" "}
        <Link to="/hooks/use-parent-tabset">
          <code>useParentTabset</code>
        </Link>{" "}
        and{" "}
        <Link to="/hooks/use-parent-tabset-state">
          <code>useParentTabsetState</code>
        </Link>{" "}
        hooks do the same for the tabset, and{" "}
        <Link to="/hooks/use-parent-workspace">
          <code>useParentWorkspace</code>
        </Link>{" "}
        returns the workspace's{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>.
      </div>
      <Code html={TabHooksHTML} />
      <div>
        By default, the content of tabs that aren't selected stays mounted. The{" "}
        <code>hiddenTabBehavior</code> prop can unmount it instead (e.g. for
        memory-intensive content), or render it within a hidden React{" "}
        <code>Activity</code> so that its effects are unmounted. It can also be
        a function, to choose per tab.
      </div>
      <Callout>
        <code>Activity</code> requires React 19.2 or newer; with older versions,{" "}
        <code>"activity"</code> behaves like <code>"keep-mounted"</code>.
      </Callout>
      <Callout intent="warning">
        Tabs are rendered using portals so that moving a tab won't cause a
        remount. Because of this, tab content is not server rendered by default.
        See{" "}
        <Link to="/examples/workspace/server-rendering">server rendering</Link>{" "}
        to opt into server rendering.
      </Callout>
    </Box>
  );
}
