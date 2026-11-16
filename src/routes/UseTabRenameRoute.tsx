import {
  Box,
  Callout,
  Code,
  Header,
  HookSignature,
  HookSignatureItem,
  SectionHeader
} from "react-lib-tools";
import { html } from "../../public/generated/examples/WorkspaceRenamableTab.json";
import { Link } from "../components/Link";

export default function UseTabRenameRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header
        section="Hooks"
        sourceCodePath="lib/workspace/hooks/useTabRename.ts"
        title="useTabRename"
      />
      <div>
        The <code>useTabRename</code> hook edits the title of the nearest tab.
        Within <code>renderTab</code>, a tab can show an input in place of its
        title while it's being edited, e.g. after it's double-clicked or F2 is
        pressed (see{" "}
        <Link to="/examples/workspace/custom-tabsets">custom tabsets</Link> for
        a demo):
      </div>
      <Code html={html} />
      <Callout intent="primary">
        Only one tab's title is edited at a time. To start editing a tab's title
        from outside of the tab (e.g. from a context menu), use the{" "}
        <code>startRenamingTab</code> method of the{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>.
      </Callout>
      <SectionHeader>Return value</SectionHeader>
      <HookSignature>
        <HookSignatureItem name="isEditing" type={<>boolean</>}>
          <p>
            The tab's title is being edited. Always <code>false</code> if the
            component isn't rendered within a tab.
          </p>
        </HookSignatureItem>
        <HookSignatureItem name="startEditing" type={<>() =&gt; void</>}>
          <p>Start editing the tab's title.</p>
        </HookSignatureItem>
        <HookSignatureItem name="inputProps" type={<>TabRenameInputProps</>}>
          <p>
            Props to spread onto the <code>input</code> that's shown in place of
            the tab's title while <code>isEditing</code> is true. The input is
            focused (with its text selected) when it's shown. Pressing Enter or
            moving focus away saves the new title, and Escape cancels; focus
            returns to the tab after either key. Titles that are empty (or only
            whitespace) or unchanged aren't saved.
          </p>
          <p>
            A saved title is reported to <code>onModelChanged</code> with the{" "}
            <code>"update"</code> reason (and{" "}
            <code>isUserInteraction: true</code>), so{" "}
            <code>onBeforeModelChange</code> can block it.
          </p>
        </HookSignatureItem>
      </HookSignature>
    </Box>
  );
}
