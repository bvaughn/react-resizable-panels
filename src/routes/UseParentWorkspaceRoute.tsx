import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseParentWorkspace.json";
import { Link } from "../components/Link";

export default function UseParentWorkspaceRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useParentWorkspace.ts"
        title="useParentWorkspace"
      />
      <div>
        The <code>useParentWorkspace</code> hook returns the nearest Workspace,
        including its <Link to="/imperative-api/workspace">imperative API</Link>
        . Components rendered within a Workspace (including tab content) can use
        it to open, close, and arrange tabs without passing refs or props down
        to them. For example, a link within a tab can open a file in another
        tab:
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>null</code> if the component isn't rendered within a{" "}
        Workspace.
      </Callout>
      <Callout intent="primary">
        The returned value doesn't change when the Workspace's model changes, so
        this hook doesn't cause components to re-render.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useParentWorkspace"
          type={
            <>
              () =&gt; <span className="tok-typeName">ParentWorkspace</span> |
              null
            </>
          }
        >
          <p>
            The Workspace's <code>id</code> and its imperative API (
            <code>addTab</code>, <code>closeTab</code>,{" "}
            <code>getActiveTabsetId</code>, <code>getModel</code>,{" "}
            <code>maximizeTabset</code>, <code>moveTab</code>,{" "}
            <code>restoreTabset</code>, <code>selectTab</code>,{" "}
            <code>setModel</code>, <code>updateTab</code>, and{" "}
            <code>updateTabset</code>).
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
