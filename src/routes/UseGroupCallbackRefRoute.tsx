import { Box, Callout, Code, ExternalLink, Header } from "react-lib-tools";
import { useGroupCallbackRef } from "react-resizable-panels";
import { html } from "../../public/generated/examples/useGroupCallbackRef.json";
import { GroupMaximizeDemo } from "../components/demos/GroupMaximizeDemo";

export default function UseGroupCallbackRefRoute() {
  const [groupRef, setGroupRef] = useGroupCallbackRef();

  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/group/useGroupCallbackRef.ts"
        title="useGroupCallbackRef"
      />
      <div>
        The <code>useGroupCallbackRef</code> hook returns a{" "}
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
      <GroupMaximizeDemo getGroup={() => groupRef} groupRef={setGroupRef} />
    </Box>
  );
}
