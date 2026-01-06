import { Box, Callout, Code, Header } from "react-lib-tools";
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
      <div className="text-lg font-bold">Parameters</div>
      <dl className="flex flex-col gap-2">
        <dd className="text-lg font-mono">
          <span className="tok-propertyName">id</span>
          <span className="tok-punctuation">:</span> string
        </dd>
        <dt className="mb-2">Uniquely identifies a specific group/layout.</dt>
        <dd className="text-lg font-mono">
          <span className="tok-propertyName">panelIds</span>
          <span className="tok-punctuation">?:</span> string[] | undefined
        </dd>
        <dt className="mb-2 flex flex-col gap-4">
          <p>
            Groups that contain conditionally-rendered Panels should use this
            parameter to determine which layout is retrieved on mount.
          </p>
          <Callout intent="warning" minimal>
            This prevents layout shift for server-rendered apps. Ids must match
            during mount to avoid layout shift.
          </Callout>
        </dt>
        <dd className="text-lg font-mono">
          <span className="tok-propertyName">storage</span>
          <span className="tok-punctuation">?:</span>{" "}
          <span className="tok-typeName">LayoutStorage</span>{" "}
          <span className="tok-punctuation">=</span> localStorage
        </dd>
        <dt className="mb-2">
          Storage API; responsible for reading and writing saved layouts.
        </dt>
        <dd className="text-lg font-mono">
          <span className="tok-propertyName">debounceSaveMs</span>
          <span className="tok-punctuation">?:</span> number{" "}
          <span className="tok-punctuation">=</span> 100
        </dd>
        <dt className="mb-2">
          Debounce save operation by the specified number of milliseconds;
          defaults to 100ms
        </dt>
      </dl>
    </Box>
  );
}
