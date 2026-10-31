import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { usePanelCallbackRef } from "react-resizable-panels";
import { html } from "../../public/generated/examples/usePanelCallbackRef.json";
import { PanelCollapseDemo } from "../components/demos/PanelCollapseDemo";

export default function UsePanelCallbackRefRoute() {
  const [panelRef, setPanelRef] = usePanelCallbackRef();

  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/flex/hooks/usePanelCallbackRef.ts"
        title="usePanelCallbackRef"
      />
      <div>
        The <code>usePanelCallbackRef</code> hook returns a{" "}
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
      <PanelCollapseDemo getPanel={() => panelRef} panelRef={setPanelRef} />
    </Box>
  );
}
