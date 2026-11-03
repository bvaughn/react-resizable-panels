import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import ParentTabsetStateJson from "../../public/generated/types/ParentTabsetState.json";
import { HookReturnType } from "../components/HookReturnType";
import type { ModelTypeMetadata } from "../components/workspace/ModelType";
import { html } from "../../public/generated/examples/UseParentTabsetState.json";
import { Link } from "../components/Link";

export default function UseParentTabsetStateRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useParentTabsetState.ts"
        title="useParentTabsetState"
      />
      <div>
        The <code>useParentTabsetState</code> hook returns the state of the
        nearest tabset. Components that use it re-render when that state
        changes. For example, a button can show whether its tabset is maximized:
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>null</code> if the component isn't rendered within a{" "}
        tabset.
      </Callout>
      <Callout intent="primary">
        Use <Link to="/hooks/use-parent-tabset">useParentTabset</Link> to
        control the tabset.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useParentTabsetState"
          type={
            <>
              () =&gt; <span className="tok-typeName">ParentTabsetState</span> |
              null
            </>
          }
        >
          <p>
            See <code>ParentTabsetState</code> (below).
          </p>
        </HookSignatureItem>
      </HookSignature>
      <HookReturnType json={ParentTabsetStateJson as ModelTypeMetadata} />
    </Box>
  );
}
