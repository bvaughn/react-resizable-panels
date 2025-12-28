import {
  Box,
  Code,
  ExternalLink,
  ImperativeHandle,
  type ImperativeHandleMetadata
} from "react-lib-tools";
import json from "../../public/generated/docs/PanelImperativeHandle.json";
import { html as usePanelCallbackRefHTML } from "../../public/generated/examples/usePanelCallbackRef.json";
import { html as usePanelRefHTML } from "../../public/generated/examples/usePanelRef.json";

export default function PanelImperativeHandleRoute() {
  return (
    <Box direction="column" gap={4}>
      <ImperativeHandle
        json={json as ImperativeHandleMetadata}
        section="Imperative API"
      />
      <div className="text-lg font-bold">Hooks</div>
      <div>
        The <code>usePanelRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react/useRef">
          mutable ref object
        </ExternalLink>
        .
      </div>
      <Code html={usePanelRefHTML} />
      <div>
        And the <code>usePanelCallbackRef</code> hook returns a{" "}
        <ExternalLink href="https://react.dev/reference/react-dom/components/common#ref-callback">
          ref callback function
        </ExternalLink>
        . This is better when sharing the ref with another hook or component.
      </div>
      <Code html={usePanelCallbackRefHTML} />
    </Box>
  );
}
