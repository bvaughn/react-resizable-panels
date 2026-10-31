import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { html } from "../../public/generated/examples/WorkspaceServerRendering.json";
import { html as SavedModelHTML } from "../../public/generated/examples/WorkspaceServerRenderingSavedModel.json";
import { Link } from "../components/Link";

export default function WorkspaceServerRenderingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Server rendering" />
      <SectionHeader>Tab content</SectionHeader>
      <div>
        Workspaces render their tabsets and tabs on the server. Tab content
        isn't server rendered by default, though: it's rendered through portals
        (so that moving a tab doesn't remount it), which React can't render on
        the server. Instead, it's rendered once hydration has finished.
      </div>
      <div>
        The <code>serverRenderTabContent</code> prop renders the content of
        selected tabs on the server. It can be <code>true</code>, or a function
        to choose per tab:
      </div>
      <Code html={html} />
      <div>
        Server-rendered content is rendered inline (within its tabset's tab
        panels) on the server and while hydrating, then moved into a portal.
      </div>
      <Callout intent="warning">
        Moving the content into a portal remounts it once (e.g. resetting its
        state and re-running its effects), so this is best suited to content
        that is cheap to mount and benefits from being in the server-rendered
        HTML.
      </Callout>
      <Callout>
        This prop has no effect for workspaces that aren't server rendered.
      </Callout>
      <SectionHeader>Saved layouts</SectionHeader>
      <div>
        A <Link to="/examples/workspace/persistent-layout">saved layout</Link>{" "}
        has to be available on the server too, so that the server and client
        render the same model. Saving it in <code>localStorage</code> doesn't
        work, since the server can't read it; a cookie (or other storage the
        server can read) does:
      </div>
      <Code html={SavedModelHTML} />
      <Callout intent="warning">
        Don't read <code>localStorage</code> while rendering (e.g. only when{" "}
        <code>window</code> is defined): the client would render a different
        layout than the server, causing hydration errors.
      </Callout>
      <Callout>
        Cookies are limited to about 4KB, which a workspace with many tabs (or a
        lot of tab data) can exceed. Larger models can be saved on the server
        (e.g. with the user's settings) and passed in the same way.
      </Callout>
    </Box>
  );
}
