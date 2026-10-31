import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseParentGroup.json";
import { Link } from "../components/Link";

export default function UseParentGroupRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/flex/hooks/useParentGroup.ts"
        title="useParentGroup"
      />
      <div>
        The <code>useParentGroup</code> hook returns the nearest Group,
        including its <Link to="/imperative-api/group">imperative API</Link>.
        Components rendered within a Group can use it to control that Group
        without passing refs or props down to them. For example, a button
        rendered within a Panel can reset the layout of its Group:
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>null</code> if the component isn't rendered within a
        Group.
      </Callout>
      <Callout intent="primary">
        The returned value doesn't change when the Group's layout changes, so
        this hook doesn't cause components to re-render.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useParentGroup"
          type={
            <>
              () =&gt; <span className="tok-typeName">ParentGroup</span> | null
            </>
          }
        >
          <p>
            The Group's <code>id</code> and <code>orientation</code>, and its
            imperative API (<code>getLayout</code> and <code>setLayout</code>).
          </p>
          <p>
            Within a Cell, this returns the nearest Group outside of the Grid
            (if there is one).
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
