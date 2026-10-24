import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseDefaultLayout.json";
import { Link } from "../components/Link";

export default function UseDefaultLayoutRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/group/useDefaultLayout.ts"
        title="useDefaultLayout"
      />
      <div>
        The <code>useDefaultLayout</code> hook saves and restores group layouts
        between page loads. It can be configured to store values using{" "}
        <code>localStorage</code>, <code>sessionStorage</code>,{" "}
        <code>cookies</code>, or any other persistence layer that makes sense
        for your application.
      </div>
      <Code html={html} />
      <div>
        Refer to the{" "}
        <Link to="/examples/persistent-layout">persistent layouts section</Link>{" "}
        for more examples of how to best use the hook in your client or
        server-rendered application.
      </div>
      <SectionHeader>Parameters</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          defaultValue="100"
          name="debounceSaveMs"
          optional
          type="number"
        >
          <p>
            Debounce save operation by the specified number of milliseconds;
            defaults to 100ms
          </p>
          <Callout intent="warning">
            This parameter corresponds to the deprecated{" "}
            <code>onLayoutChange</code> callback. Code using the new{" "}
            <code>onLayoutChanged</code> callback (shown above) does not need to
            be debounced.
          </Callout>
        </HookSignatureItem>
        <HookSignatureItem name="id" type="string">
          Uniquely identifies a specific group/layout.
        </HookSignatureItem>
        <HookSignatureItem
          name="onlySaveAfterUserInteractions"
          optional
          type="boolean"
        >
          Only auto-save layouts that were directly caused by user input (e.g.
          keyboard or mouse events). Ignore layout changes resulting from
          imperative API calls or window resize events.
        </HookSignatureItem>
        <HookSignatureItem name="panelIds" optional type="string[] | undefined">
          <p>
            Groups that contain conditionally-rendered Panels should use this
            parameter to determine which layout is retrieved on mount.
          </p>
          <Callout intent="warning">
            This prevents layout shift for server-rendered apps. Ids must match
            during mount to avoid layout shift.
          </Callout>
        </HookSignatureItem>
        <HookSignatureItem
          defaultValue="localStorage"
          name="storage"
          optional
          type={<span className="tok-typeName">LayoutStorage</span>}
        >
          Storage API; responsible for reading and writing saved layouts.
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
