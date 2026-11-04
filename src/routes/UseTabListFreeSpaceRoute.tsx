import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/WorkspaceOverflowToolbar.json";
import { Link } from "../components/Link";

export default function UseTabListFreeSpaceRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useTabListFreeSpace.ts"
        title="useTabListFreeSpace"
      />
      <div>
        The <code>useTabListFreeSpace</code> hook returns the space in the
        nearest tabset's tab list that its tabs don't use. Components that use
        it re-render when it changes (e.g. when the tabset is resized, or tabs
        are added or removed), before the browser paints. For example, a toolbar
        can move items into a "…" menu once they no longer fit (see{" "}
        <Link to="/examples/workspace/custom-tabsets">custom tabsets</Link> for
        a demo):
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>undefined</code> if the component isn't rendered within a
        tabset (or the tab list hasn't been measured yet, e.g. while server
        rendering, or before the component re-renders right after the tabset is
        first rendered; that re-render happens before the browser paints).
      </Callout>
      <Callout intent="primary">
        To read the free space outside of a tabset (e.g. from a toolbar that's
        rendered elsewhere and portaled into the tabset), use the{" "}
        <code>getTabListFreeSpace</code> and{" "}
        <code>subscribeToTabListFreeSpace</code> methods of the{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useTabListFreeSpace"
          type={<>() =&gt; number | undefined</>}
        >
          <p>
            The space (in pixels) that the tabs don't use, measured along the
            tab list (its width, or its height if its tabs are placed on the
            left or right). It's negative once the tabs overflow, by the amount
            they overflow. The tab list's <code>--tab-list-free-space</code>{" "}
            custom property has the same value.
          </p>
          <p>
            Each value is measured with the toolbar as it's shown at the time; a
            toolbar that responds to the free space should do so when it changes
            (rather than again after the toolbar itself changes, which would
            count that change twice).
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
