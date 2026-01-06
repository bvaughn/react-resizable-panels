import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/usePanelRef.json";
import { Link } from "../components/Link";

export default function UsePanelRefRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/panel/usePanelRef.ts"
        title="usePanelRef"
      />
      <div>
        The <code>usePanelRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react/useRef">
          mutable ref object
        </ExternalLink>
        .
      </div>
      <Code html={html} />
      <Callout intent="warning">
        This component is useful for situations where you only need a local (to
        your component) reference to the{" "}
        <Link to="/imperative-api/panel">imperative Panel API</Link>. If you
        need to share the ref with another component or hook, use the{" "}
        <Link to="/hooks/use-panel-callback-ref">callback ref hook</Link>{" "}
        instead.
      </Callout>
    </Box>
  );
}
