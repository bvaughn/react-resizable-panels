import { Box, Code, ExternalLink, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/useGroupCallbackRef.json";

export default function UseGroupRefRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/group/useGroupCallbackRef.ts"
        title="useGroupCallbackRef"
      />
      <div>
        And the <code>useGroupCallbackRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react-dom/components/common#ref-callback">
          ref callback function
        </ExternalLink>{" "}
        and value tuple.
      </div>
      <Code html={html} />
    </Box>
  );
}
