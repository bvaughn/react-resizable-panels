import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/useGridRef.json";
import { Link } from "../components/Link";

export default function UseGridRefRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/grid/useGridRef.ts"
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
      <Callout intent="warning">
        This component is useful for situations where you only need a local (to
        your component) reference to the{" "}
        <Link to="/imperative-api/grid">imperative Grid API</Link>. If you need
        to share the ref with another component or hook, use the{" "}
        <Link to="/hooks/use-grid-callback-ref">callback ref hook</Link>{" "}
        instead.
      </Callout>
    </Box>
  );
}
