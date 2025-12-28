import {
  Box,
  Code,
  ExternalLink,
  ImperativeHandle,
  type ImperativeHandleMetadata
} from "react-lib-tools";
import json from "../../public/generated/docs/GroupImperativeHandle.json";
import { html as useGroupCallbackRefHTML } from "../../public/generated/examples/useGroupCallbackRef.json";
import { html as useGroupRefHTML } from "../../public/generated/examples/useGroupRef.json";

export default function PanelImperativeHandleRoute() {
  return (
    <Box direction="column" gap={4}>
      <ImperativeHandle
        json={json as ImperativeHandleMetadata}
        section="Imperative API"
      />
      <div className="text-lg font-bold">Hooks</div>
      <div>
        The <code>useGroupRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react/useRef">
          mutable ref object
        </ExternalLink>
        .
      </div>
      <Code html={useGroupRefHTML} />
      <div>
        And the <code>useGroupCallbackRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react-dom/components/common#ref-callback">
          ref callback function
        </ExternalLink>
        . This is better when sharing the ref with another hook or component.
      </div>
      <Code html={useGroupCallbackRefHTML} />
    </Box>
  );
}
