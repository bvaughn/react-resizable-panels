import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseParentTabset.json";
import { Link } from "../components/Link";

export default function UseParentTabsetRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useParentTabset.ts"
        title="useParentTabset"
      />
      <div>
        The <code>useParentTabset</code> hook returns the nearest tabset.
        Components rendered within a tabset (e.g. by the Workspace's{" "}
        <code>renderTabsetToolbar</code> prop) or within the content of one of
        its tabs can use it to add tabs to it or to maximize it. For example, a
        button in a tabset's toolbar can add a new tab to that tabset:
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>null</code> if the component isn't rendered within a{" "}
        tabset.
      </Callout>
      <Callout intent="primary">
        The returned value doesn't change for the life of the tabset, so it's
        safe to use as an effect dependency. Use{" "}
        <Link to="/hooks/use-parent-tabset-state">useParentTabsetState</Link>{" "}
        for values that should cause components to re-render.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useParentTabset"
          type={
            <>
              () =&gt; <span className="tok-typeName">ParentTabset</span> | null
            </>
          }
        >
          <p>
            The tabset's <code>id</code>, the <code>workspaceId</code> of the
            Workspace that contains it, and methods to control it (
            <code>addTab</code>, <code>close</code>, <code>isMaximized</code>,{" "}
            <code>maximize</code>, and <code>restore</code>).
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
