import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/useGroupRef.json";
import { Link } from "../components/Link";

export default function UseGroupRefRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/group/useGroupRef.ts"
        title="useGroupRef"
      />
      <div>
        The <code>useGroupRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react/useRef">
          mutable ref object
        </ExternalLink>
        .
      </div>
      <Code html={html} />
      <Callout intent="warning">
        This component is useful for situations where you only need a local (to
        your component) reference to the{" "}
        <Link to="/imperative-api/group">imperative Group API</Link>. If you
        need to share the ref with another component or hook, use the{" "}
        <Link to="/hooks/use-group-callback-ref">callback ref hook</Link>{" "}
        instead.
      </Callout>
    </Box>
  );
}
