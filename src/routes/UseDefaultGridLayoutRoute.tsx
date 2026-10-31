import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseDefaultGridLayout.json";
import { Link } from "../components/Link";

export default function UseDefaultGridLayoutRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/grid/hooks/useDefaultGridLayout.ts"
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
      <Callout intent="primary">
        A saved layout is ignored for an axis if its track ids don't match the
        Grid's (e.g. after a column has been added or removed).
      </Callout>
      <SectionHeader>Parameters</SectionHeader>
      <HookSignature>
        <HookSignatureItem name="id" type="string">
          Uniquely identifies a specific grid/layout.
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
