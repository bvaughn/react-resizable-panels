import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import PopoutWindowJson from "../../public/generated/types/PopoutWindow.json";
import PopoutWindowRectJson from "../../public/generated/types/PopoutWindowRect.json";
import PopoutWindowStateJson from "../../public/generated/types/PopoutWindowState.json";
import PopoutWorkspacePropsJson from "../../public/generated/types/PopoutWorkspaceProps.json";
import PopoutWindowsJson from "../../public/generated/types/PopoutWindows.json";
import UsePopoutWindowsOptionsJson from "../../public/generated/types/UsePopoutWindowsOptions.json";
import { html as OnOpenHTML } from "../../public/generated/examples/UsePopoutWindowsOnOpen.json";
import { html as RestoreHTML } from "../../public/generated/examples/UsePopoutWindowsRestore.json";
import { html } from "../../public/generated/examples/WorkspacePopoutWindows.json";
import { HookReturnType } from "../components/HookReturnType";
import { Link } from "../components/Link";
import type { ModelTypeMetadata } from "../components/workspace/ModelType";

export default function UsePopoutWindowsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/usePopoutWindows.tsx"
        title="usePopoutWindows"
      />
      <div>
        The <code>usePopoutWindows</code> hook opens tabs in popout windows,
        each with its own Workspace. Call its <code>open</code> function (e.g.
        from a button that pops out a tab), and render the Workspaces it returns
        from <code>render</code> alongside the main one (see{" "}
        <Link to="/examples/workspace/multiple-windows/popout-windows">
          popout windows
        </Link>{" "}
        for a demo):
      </div>
      <Code html={html} />
      <div>
        The page's stylesheets are copied into each new window. When the user
        closes a popout window, its tabs are moved back to the main workspace; a
        popout window is closed once its last tab is dragged out of it, and
        popout windows are closed along with the page that opened them (or the
        component that uses the hook).
      </div>
      <Callout intent="primary">
        Browsers block popup windows that aren't opened in response to user
        input, so call <code>open</code> from a click (or another user action).
        It returns <code>false</code> if the window was blocked.
      </Callout>
      <SectionHeader>Customizing popout windows</SectionHeader>
      <div>
        The <code>onOpen</code> option is called with each new window and the
        element its content is rendered into, before the content is rendered:
      </div>
      <Code html={OnOpenHTML} />
      <div>
        Stylesheets are copied as they are when the window opens, including
        rules that CSS-in-JS libraries insert with <code>insertRule</code>, and
        stylesheets added to the page's head afterward are copied too. Rules
        inserted into an existing stylesheet afterward aren't; libraries that
        insert rules as components render can usually be configured (e.g. in{" "}
        <code>onOpen</code>) to insert them into the new window's document{" "}
        instead. Setting <code>copyStyles</code> to <code>false</code> stops all
        copying, including the page's plain stylesheets, so it's usually best
        left on. Stylesheets removed or edited in place after they're copied
        aren't updated in popout windows.
      </div>
      <SectionHeader>Saving and restoring popout windows</SectionHeader>
      <div>
        The <code>onCloseAll</code> option is called with each popout window's
        model and position when the page is closed (or reloaded) or the
        component that uses the hook unmounts (e.g. a route change), just before
        the popout windows are closed (this includes when the component is
        hidden by <code>Activity</code>, and Fast Refresh in development).
        Browsers won't open them again until the user interacts with the page,
        so restore them from a click. Windows that the browser blocks (
        <code>open</code> returns <code>false</code>) are kept so they can be
        reopened later (but are lost if the page is closed again first, since{" "}
        <code>onCloseAll</code> replaces the saved state). The main workspace's
        model must be saved too (see{" "}
        <Link to="/examples/workspace/persistent-layout">persistence</Link>), or
        restored popouts will duplicate tabs it shows again. Calling{" "}
        <code>open</code> with a model that has no tabs does nothing:
      </div>
      <Code html={RestoreHTML} />
      <Callout intent="warning">
        Some browsers only open one popup window per click.
      </Callout>
      <SectionHeader>Options</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="usePopoutWindows"
          type={
            <>
              (options:{" "}
              <span className="tok-typeName">UsePopoutWindowsOptions</span>)
              =&gt; <span className="tok-typeName">PopoutWindows</span>
            </>
          }
        >
          <p>
            See <code>UsePopoutWindowsOptions</code> and{" "}
            <code>PopoutWindows</code> (below).
          </p>
        </HookSignatureItem>
      </HookSignature>
      <HookReturnType json={UsePopoutWindowsOptionsJson as ModelTypeMetadata} />
      <HookReturnType json={PopoutWindowsJson as ModelTypeMetadata} />
      <HookReturnType json={PopoutWindowJson as ModelTypeMetadata} />
      <HookReturnType json={PopoutWindowRectJson as ModelTypeMetadata} />
      <HookReturnType json={PopoutWindowStateJson as ModelTypeMetadata} />
      <HookReturnType json={PopoutWorkspacePropsJson as ModelTypeMetadata} />
    </Box>
  );
}
