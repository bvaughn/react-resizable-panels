import { Box, Code, ExternalLink, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/useWorkspaceCallbackRef.json";
import { Link } from "../components/Link";

export default function UseWorkspaceCallbackRefRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useWorkspaceCallbackRef.ts"
        title="useWorkspaceCallbackRef"
      />
      <div>
        The <code>useWorkspaceCallbackRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react-dom/components/common#ref-callback">
          ref callback function
        </ExternalLink>{" "}
        and value tuple. The value is the{" "}
        <Link to="/imperative-api/workspace">imperative Workspace API</Link>.
      </div>
      <Code html={html} />
    </Box>
  );
}
