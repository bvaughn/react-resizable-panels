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
import { html } from "../../public/generated/examples/UseIsResizingGrid.json";
import { Link } from "../components/Link";
import { Cell } from "../components/styled-panels/Cell";
import { Grid } from "../components/styled-panels/Grid";

export default function UseIsResizingGridRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/shared/hooks/useIsResizing.ts"
        title="useIsResizing"
      />
      <div>
        The <code>useIsResizing</code> hook returns <code>true</code> while a
        Grid's track boundaries are being dragged. Components rendered within a
        Grid can use it to avoid expensive work during a drag, such as rendering
        a lightweight placeholder in place of a chart:
      </div>
      <Code html={html} />
      <Grid className="h-40!" columns={2} rows={2}>
        <Cell column={0} row={0} rowSpan={2}>
          <ResizingStatus />
        </Cell>
        <Cell column={1} row={0}>
          <ResizingStatus />
        </Cell>
        <Cell column={1} row={1}>
          <ResizingStatus />
        </Cell>
      </Grid>
      <Callout intent="primary">
        Layout changes made with the keyboard or the{" "}
        <Link to="/imperative-api/grid">imperative API</Link>, and changes to
        the Grid's size, aren't included.
      </Callout>
      <Callout intent="primary">
        The same hook works within{" "}
        <Link to="/hooks/use-is-resizing">Groups</Link>. Content within a Group
        that's nested in a Cell follows the Group, since it's closer.
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
            Checks the nearest Grid or Group (whichever is closer) unless an{" "}
            <code>id</code> is specified, e.g. for a component rendered outside
            of the Grid.
          </p>
          <p>
            Returns <code>false</code> if the component isn't rendered within a
            Grid or Group and no <code>id</code> is specified.
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
