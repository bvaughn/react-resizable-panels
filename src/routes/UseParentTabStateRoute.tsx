import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseParentTabState.json";
import { Link } from "../components/Link";

export default function UseParentTabStateRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useParentTabState.ts"
        title="useParentTabState"
      />
      <div>
        The <code>useParentTabState</code> hook returns the state of the nearest
        tab. Components that use it re-render when that state changes. For
        example, an editor can focus itself whenever its tab is shown:
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>null</code> if the component isn't rendered within a tab.
      </Callout>
      <Callout intent="primary">
        A tab can be selected but not visible, if its tabset is covered by
        another, maximized tabset. Use <code>isVisible</code> to pause work
        while a tab can't be seen, and{" "}
        <Link to="/hooks/use-parent-tab">useParentTab</Link> to control the tab.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useParentTabState"
          type={
            <>
              () =&gt; <span className="tok-typeName">ParentTabState</span> |
              null
            </>
          }
        >
          <p>
            Whether the user can close or drag the tab (
            <code>isCloseDisabled</code> and <code>isDragDisabled</code>, which
            account for both the tab's flags and the Workspace's{" "}
            <code>disabled</code> prop), whether it's selected (
            <code>isSelected</code>) and visible (<code>isVisible</code>), and
            the id of the tabset that contains it (<code>tabsetId</code>).
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
