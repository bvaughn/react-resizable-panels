import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { useGridCallbackRef } from "react-resizable-panels";
import { html } from "../../public/generated/examples/useGridCallbackRef.json";
import { GridMaximizeDemo } from "../components/demos/GridMaximizeDemo";

export default function UseGridCallbackRefRoute() {
  const [gridRef, setGridRef] = useGridCallbackRef();

  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/grid/hooks/useGridCallbackRef.ts"
        title="useGridCallbackRef"
      />
      <div>
        The <code>useGridCallbackRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react-dom/components/common#ref-callback">
          ref callback function
        </ExternalLink>{" "}
        and value tuple.
      </div>
      <Code html={html} />
      <Callout>
        The example code above has been simplified to highlight usage of the
        ref.
      </Callout>
      <GridMaximizeDemo getGrid={() => gridRef} gridRef={setGridRef} />
    </Box>
  );
}
