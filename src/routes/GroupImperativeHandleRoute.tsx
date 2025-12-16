import json from "../../public/generated/js-docs/GroupImperativeHandle.json";
import { Box } from "../components/Box";
import { Code } from "../components/code/Code";
import { ImperativeHandle } from "../components/handles/ImperativeHandle";
import type { ImperativeHandleMetadata } from "../types";
import { html as useGroupRefHTML } from "../../public/generated/code-snippets/useGroupRef.json";
import { html as useGroupCallbackRefHTML } from "../../public/generated/code-snippets/useGroupCallbackRef.json";
import { ExternalLink } from "../components/ExternalLink";

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
