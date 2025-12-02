import json from "../../public/generated/js-docs/PanelImperativeHandle.json";
import { Box } from "../components/Box";
import { Code } from "../components/code/Code";
import { ImperativeHandle } from "../components/handles/ImperativeHandle";
import type { ImperativeHandleMetadata } from "../types";
import { html as usePanelRefHTML } from "../../public/generated/code-snippets/usePanelRef.json";
import { html as usePanelCallbackRefHTML } from "../../public/generated/code-snippets/usePanelCallbackRef.json";
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
