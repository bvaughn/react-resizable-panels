import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/useWorkspaceRef.json";
import { Link } from "../components/Link";

export default function UseWorkspaceRefRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useWorkspaceRef.ts"
        title="useWorkspaceRef"
      />
      <div>
        The <code>useWorkspaceRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react/useRef">
          mutable ref object
        </ExternalLink>
        .
      </div>
      <Code html={html} />
      <Callout intent="warning">
        This hook is useful for situations where you only need a local (to your
        component) reference to the{" "}
        <Link to="/imperative-api/workspace">imperative Workspace API</Link>. If
        you need to share the ref with another component or hook, use the{" "}
        <Link to="/hooks/use-workspace-callback-ref">callback ref hook</Link>{" "}
        instead.
      </Callout>
    </Box>
  );
}
