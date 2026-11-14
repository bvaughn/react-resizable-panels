import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html as HiddenTabBehaviorHTML } from "../../public/generated/examples/WorkspaceHiddenTabBehavior.json";
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
      <Callout intent="warning">
        Moving a tab preserves its content's React state, but its elements are
        moved within the document, which resets some browser state: iframes are
        reloaded, playing media is paused, and focused elements are blurred.
      </Callout>
      <Callout intent="warning">
        Tabs are rendered using portals so that moving a tab won't cause a
        remount. Because of this, tab content is not server rendered by default.
        See{" "}
        <Link to="/examples/workspace/server-rendering">server rendering</Link>{" "}
        to opt into server rendering.
      </Callout>
      <SectionHeader>Performance</SectionHeader>
      <div>
        By default, every tab's content is mounted when the workspace is, and
        stays mounted while the tab is hidden, so switching tabs is instant and
        nothing is lost. For workspaces with many tabs (or expensive ones), two
        props trade some of that for less work.
      </div>
      <div>
        The <code>lazyTabContent</code> prop waits to mount a tab's content
        until the tab is first visible, so only the tabs that are shown cost
        anything when the workspace first renders (e.g. in tabsets with many
        tabs, or tabsets that start collapsed).
      </div>
      <div>
        The <code>hiddenTabBehavior</code> prop decides what happens to content
        (once it has been mounted) while its tab is hidden:
      </div>
      <ul className="list-disc pl-6">
        <li>
          <code>"keep-mounted"</code> (the default): content stays mounted, and
          its effects keep running (e.g. subscriptions and timers).
        </li>
        <li>
          <code>"activity"</code>: content stays mounted within a hidden React{" "}
          <code>Activity</code>, so its state is kept but its effects are
          unmounted. Hidden content that hasn't been shown yet is rendered at a
          low priority, after the visible content (unless it's lazy).
        </li>
        <li>
          <code>"unmount"</code>: content is unmounted, e.g. for
          memory-intensive content. Its state is lost, so keep anything that
          should survive in the tab's <code>data</code>.
        </li>
      </ul>
      <div>
        A tab is visible when it's selected in a tabset that isn't collapsed or
        covered by a maximized tabset (floating tabsets are never covered); see{" "}
        <code>useParentTabState().isVisible</code>. Collapsing a tabset and
        maximizing another hide content (with <code>"activity"</code> and{" "}
        <code>"unmount"</code>), but temporary states like dragging a separator
        or collapsing tabsets to fit the window don't.
      </div>
      <div>
        Both props can also be functions, to choose for each tab, e.g. to wait
        to mount charts (which are expensive to render) until they're shown, and
        to unmount logs (which use a lot of memory) while they're hidden:
      </div>
      <Code html={HiddenTabBehaviorHTML} />
      <Callout>
        <code>Activity</code> requires React 19.2 or newer; with older versions,{" "}
        <code>"activity"</code> behaves like <code>"keep-mounted"</code>.
      </Callout>
    </Box>
  );
}
