import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseParentGrid.json";
import { Link } from "../components/Link";

export default function UseParentGridRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/grid/hooks/useParentGrid.ts"
        title="useParentGrid"
      />
      <div>
        The <code>useParentGrid</code> hook returns the nearest Grid, including
        its <Link to="/imperative-api/grid">imperative API</Link>. Components
        rendered within a Grid can use it to control that Grid without passing
        refs or props down to them. For example, a button rendered within a Cell
        can resize one of the Grid's columns:
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>null</code> if the component isn't rendered within a Grid.
      </Callout>
      <Callout intent="primary">
        The returned value doesn't change when the Grid's layout changes, so
        this hook doesn't cause components to re-render.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useParentGrid"
          type={
            <>
              () =&gt; <span className="tok-typeName">ParentGrid</span> | null
            </>
          }
        >
          <p>
            The Grid's <code>id</code> and its imperative API (
            <code>getLayout</code>, <code>getTrackById</code>,{" "}
            <code>getTrackByIndex</code>, and <code>setLayout</code>).
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
