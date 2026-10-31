import { Box, Callout, Code, Header } from "react-lib-tools";
import { html } from "../../public/generated/examples/WorkspacePersistence.json";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { Link } from "../components/Link";
import { initialModel } from "./examples/WorkspaceModel";

export default function WorkspacePersistenceRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Persistent layouts" />
      <div>
        A workspace's model is serializable, so it can be saved and restored.
        Save it from the <code>onModelChanged</code> callback, and restore it
        with the <code>defaultModel</code> prop:
      </div>
      <Code html={html} />
      <div>
        Rearrange the workspace below, then reload the page to see the layout
        restored.
      </div>
      <DemoWorkspace
        defaultModel={initialModel}
        showResetButton
        storageKey="react-resizable-panels:workspace-persistence-demo"
      />
      <ul className="list-disc pl-6">
        <li>
          <code>onModelChanged</code> is called after each change: when a tab is
          moved, selected, added, or closed, when a tabset is maximized or
          restored, and when a resize ends (not while the pointer is still
          moving). Its second argument describes the change.
        </li>
        <li>
          Saved models include each tab's <code>data</code>, so it should be
          serializable.
        </li>
        <li>
          Models include a <code>version</code>, so that models saved by older
          versions of the library can be migrated.
        </li>
        <li>
          To restore a layout after the workspace has mounted (e.g. a "reset
          layout" button), use the{" "}
          <Link to="/imperative-api/workspace">imperative</Link>{" "}
          <code>setModel</code> method.
        </li>
      </ul>
      <Callout>
        Content that isn't part of the model (e.g. the text in a notes tab)
        isn't saved; tabs can save it in their <code>data</code> with the{" "}
        <code>updateTab</code> method.
      </Callout>
      <div>
        The example above works well with client-rendered applications. For
        server-rendered applications, see{" "}
        <Link to="/examples/workspace/server-rendering">server rendering</Link>.
      </div>
    </Box>
  );
}
