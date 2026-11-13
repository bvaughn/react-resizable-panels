import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/WorkspaceHiddenTabsMenu.json";
import { Link } from "../components/Link";

export default function UseTabListOverflowRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useTabListOverflow.ts"
        title="useTabListOverflow"
      />
      <div>
        The <code>useTabListOverflow</code> hook returns which of the nearest
        tabset's tabs are out of view, because its tab list overflows and is
        scrolled. Components that use it re-render when they change (e.g. when
        the tab list is scrolled or resized, or tabs are added or removed);
        apart from scrolling by the user, that happens before the browser
        paints. For example, a tabset's toolbar can list them in a menu (see{" "}
        <Link to="/examples/workspace/custom-tabsets">custom tabsets</Link> for
        a demo):
      </div>
      <Code html={html} />
      <Callout intent="primary">
        A tab is scrolled into view whenever it's selected (e.g. with the{" "}
        <code>selectTab</code> method of{" "}
        <Link to="/hooks/use-parent-tabset">
          <code>useParentTabset</code>
        </Link>
        ), so a menu like this one only needs to select it.
      </Callout>
      <Callout intent="primary">
        No tabs are reported if the component isn't rendered within a tabset (or
        the tab list hasn't been measured yet, e.g. while server rendering, or
        before the component re-renders right after the tabset is first
        rendered; that re-render happens before the browser paints). To read
        them outside of a tabset, use the <code>getTabListOverflow</code> and{" "}
        <code>subscribeToTabListOverflow</code> methods of the{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>.
      </Callout>
      <SectionHeader>Parameters</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="includePartiallyVisible"
          type={<>boolean | undefined</>}
        >
          <p>
            Also include tabs that are only partly visible (cut off by an edge
            of the tab list), e.g. for a menu that lists them too. By default,
            only tabs that are entirely out of view are included.
          </p>
        </HookSignatureItem>
      </HookSignature>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useTabListOverflow"
          type={
            <>
              (options?: {"{ includePartiallyVisible?: boolean }"}) =&gt;
              string[]
            </>
          }
        >
          <p>
            Ids of the tabs that are out of view, in the order they're shown.
            The same array is returned until they change, so it can be used as
            an effect dependency.
          </p>
          <p>
            Tabs that aren't rendered at all (e.g. hidden with{" "}
            <code>display: none</code>) aren't included.
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
