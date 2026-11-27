import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { useIsResizing } from "react-resizable-panels";
import { html } from "../../public/generated/examples/UseIsResizing.json";
import { Link } from "../components/Link";
import { Group } from "../components/styled-panels/Group";
import { Panel } from "../components/styled-panels/Panel";
import { Separator } from "../components/styled-panels/Separator";

export default function UseIsResizingRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/shared/hooks/useIsResizing.ts"
        title="useIsResizing"
      />
      <div>
        The <code>useIsResizing</code> hook returns <code>true</code> while a
        Group's separators (or a Grid's track boundaries) are being dragged.
        Components rendered within a Group or Grid can use it to avoid expensive
        work during a drag, such as rendering a lightweight placeholder in place
        of a chart:
      </div>
      <Code html={html} />
      <Group>
        <Panel>
          <ResizingStatus />
        </Panel>
        <Separator />
        <Panel>
          <ResizingStatus />
        </Panel>
      </Group>
      <Callout intent="primary">
        Layout changes made with the keyboard or the imperative API (e.g.{" "}
        <Link to="/imperative-api/group">Group API</Link>), and container size
        changes, aren't included.
      </Callout>
      <Callout intent="primary">
        The same hook works within{" "}
        <Link to="/hooks/use-is-resizing-grid">Grids</Link>. Content within a
        Grid that's nested in a Panel follows the Grid, since it's closer.
      </Callout>
      <SectionHeader>Signature</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useIsResizing"
          type={
            <>
              (id?: <span className="tok-typeName">string</span>) =&gt;{" "}
              <span className="tok-typeName">boolean</span>
            </>
          }
        >
          <p>
            Checks the nearest Group or Grid (whichever is closer) unless an{" "}
            <code>id</code> is specified, e.g. for a component rendered outside
            of the Group or Grid.
          </p>
          <p>
            Returns <code>false</code> if the component isn't rendered within a
            Group or Grid and no <code>id</code> is specified.
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}

function ResizingStatus() {
  const isResizing = useIsResizing();

  return (
    <div className="flex h-full items-center justify-center">
      {isResizing ? "resizing…" : "idle"}
    </div>
  );
}
