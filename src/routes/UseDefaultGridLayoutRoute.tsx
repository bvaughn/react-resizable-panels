import { Box, Callout, Code, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/UseDefaultGridLayout.json";
import { Link } from "../components/Link";

export default function UseDefaultGridLayoutRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/components/grid/useDefaultGridLayout.ts"
        title="useDefaultGridLayout"
      />
      <div>
        The <code>useDefaultGridLayout</code> hook saves and restores grid
        layouts (both columns and rows) between page loads. It can be configured
        to store values using <code>localStorage</code>,{" "}
        <code>sessionStorage</code>, <code>cookies</code>, or any other
        persistence layer that makes sense for your application.
      </div>
      <Code html={html} />
      <div>
        It works the same way as the{" "}
        <Link to="/hooks/use-default-layout">useDefaultLayout</Link> hook does
        for groups; refer to the{" "}
        <Link to="/examples/persistent-layout">persistent layouts section</Link>{" "}
        for more examples of how to best use it in your client or
        server-rendered application.
      </div>
      <Callout intent="primary" minimal>
        A saved layout is ignored for an axis if its track ids don't match the
        Grid's (e.g. after a column has been added or removed).
      </Callout>
      <div className="text-lg font-bold">Parameters</div>
      <dl className="flex flex-col gap-2">
        <dd className="text-lg font-mono">
          <span className="tok-propertyName">id</span>
          <span className="tok-punctuation">:</span> string
        </dd>
        <dt className="mb-2">Uniquely identifies a specific grid/layout.</dt>
        <dd className="text-lg font-mono">
          <span className="tok-propertyName">
            onlySaveAfterUserInteractions
          </span>
          <span className="tok-punctuation">?:</span> boolean
        </dd>
        <dt className="mb-2">
          Only auto-save layouts that were directly caused by user input (e.g.
          keyboard or mouse events). Ignore layout changes resulting from
          imperative API calls or window resize events.
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
      </dl>
    </Box>
  );
}
