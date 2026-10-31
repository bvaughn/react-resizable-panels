import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/UseParentPanel.json";
import { Link } from "../components/Link";

export default function UseParentPanelRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/flex/hooks/useParentPanel.ts"
        title="useParentPanel"
      />
      <div>
        The <code>useParentPanel</code> hook returns the nearest Panel,
        including its <Link to="/imperative-api/panel">imperative API</Link>.
        Components rendered within a Panel can use it to control that Panel
        without passing refs or props down to them. For example, a button
        rendered within a Panel can collapse it:
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Returns <code>null</code> if the component isn't rendered within a
        Panel.
      </Callout>
      <Callout intent="primary">
        The returned value doesn't change when the Panel is resized, so this
        hook doesn't cause components to re-render.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem
          name="useParentPanel"
          type={
            <>
              () =&gt; <span className="tok-typeName">ParentPanel</span> | null
            </>
          }
        >
          <p>
            The Panel's <code>id</code>, the <code>groupId</code> of the Group
            that contains it, and its imperative API (<code>collapse</code>,{" "}
            <code>expand</code>, <code>getSize</code>, <code>isCollapsed</code>,
            and <code>resize</code>).
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
