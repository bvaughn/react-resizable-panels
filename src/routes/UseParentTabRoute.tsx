import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseParentTab.json";
import { Link } from "../components/Link";

export default function UseParentTabRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useParentTab.ts"
        title="useParentTab"
      />
      <div>
        The <code>useParentTab</code> hook returns the nearest tab. Components
        rendered within a tab (by the Workspace's <code>renderTab</code> prop)
        or within a tab's content can use it to close or select the tab. For
        example, an editor can close its tab when its file is deleted:
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>null</code> if the component isn't rendered within a tab.
      </Callout>
      <Callout intent="primary">
        The returned value doesn't change for the life of the tab (even when
        it's moved), so it's safe to use as an effect dependency. Use{" "}
        <Link to="/hooks/use-parent-tab-state">useParentTabState</Link> for
        values that should cause components to re-render.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useParentTab"
          type={
            <>
              () =&gt; <span className="tok-typeName">ParentTab</span> | null
            </>
          }
        >
          <p>
            The tab's <code>id</code>, the <code>workspaceId</code> of the
            Workspace that contains it, and methods to control it (
            <code>close</code>, <code>getTabsetId</code>,{" "}
            <code>isSelected</code>, and <code>select</code>).
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
