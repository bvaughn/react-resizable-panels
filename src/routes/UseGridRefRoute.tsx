import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { useGridRef } from "react-resizable-panels";
import { html } from "../../public/generated/examples/useGridRef.json";
import { GridMaximizeDemo } from "../components/demos/GridMaximizeDemo";
import { Link } from "../components/Link";

export default function UseGridRefRoute() {
  const ref = useGridRef();

  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/grid/hooks/useGridRef.ts"
        title="useGridRef"
      />
      <div>
        The <code>useGridRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react/useRef">
          mutable ref object
        </ExternalLink>
        .
      </div>
      <Code html={html} />
      <Callout>
        The example code above has been simplified to highlight usage of the
        ref.
      </Callout>
      <GridMaximizeDemo getGrid={() => ref.current} gridRef={ref} />
      <Callout intent="warning">
        This hook is useful for situations where you only need a local (to your
        component) reference to the{" "}
        <Link to="/imperative-api/grid">imperative Grid API</Link>. If you need
        to share the ref with another component or hook, use the{" "}
        <Link to="/hooks/use-grid-callback-ref">callback ref hook</Link>{" "}
        instead.
      </Callout>
    </Box>
  );
}
