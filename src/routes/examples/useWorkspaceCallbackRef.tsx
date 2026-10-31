import type { WorkspaceModel } from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

import {
  Workspace,
  type WorkspaceImperativeHandle,
  useWorkspaceCallbackRef
} from "react-resizable-panels";

function ExampleComponent() {
  // workspace can safely be shared with other components, context, and hooks
  // It can also be used as a dependency to effects
  const [workspace, setWorkspace] = useWorkspaceCallbackRef<{ path: string }>();

  return (
    <>
      <OpenFileButton path="README.md" workspace={workspace} />
      <Workspace
        defaultModel={initialModel}
        renderTabContent={(tab) => <Editor path={tab.data.path} />}
        workspaceRef={setWorkspace}
      />
    </>
  );
}

function OpenFileButton({
  path,
  workspace
}: {
  path: string;
  workspace: WorkspaceImperativeHandle<{ path: string }> | null;
}) {
  return (
    <button
      onClick={() =>
        // Selects the tab instead if it's already open
        workspace?.addTab({ data: { path }, id: path, title: path })
      }
    >
      Open {path}
    </button>
  );
}

// <end>

export { ExampleComponent };
