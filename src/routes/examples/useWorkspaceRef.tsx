import type { WorkspaceModel } from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

import { Workspace, useWorkspaceRef } from "react-resizable-panels";

function ExampleComponent() {
  const ref = useWorkspaceRef<{ path: string }>();

  return (
    <>
      <Workspace
        defaultModel={initialModel}
        renderTabContent={(tab) => <Editor path={tab.data.path} />}
        workspaceRef={ref}
      />
      <button onClick={() => ref.current?.setModel(initialModel)}>
        Reset layout
      </button>
    </>
  );
}

// <end>

export { ExampleComponent };
