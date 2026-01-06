import { Box, Code, ExternalLink, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/usePanelCallbackRef.json";

export default function UsePanelRefRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/panel/usePanelCallbackRef.ts"
        title="usePanelCallbackRef"
      />
      <div>
        And the <code>usePanelCallbackRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react-dom/components/common#ref-callback">
          ref callback function
        </ExternalLink>{" "}
        and value tuple. .
      </div>
      <Code html={html} />
    </Box>
  );
}
