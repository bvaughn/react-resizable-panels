import { Box, Code, ExternalLink, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/useGridCallbackRef.json";

export default function UseGridCallbackRefRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/grid/useGridCallbackRef.ts"
        title="useGridCallbackRef"
      />
      <div>
        And the <code>useGridCallbackRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react-dom/components/common#ref-callback">
          ref callback function
        </ExternalLink>{" "}
        and value tuple.
      </div>
      <Code html={html} />
    </Box>
  );
}
