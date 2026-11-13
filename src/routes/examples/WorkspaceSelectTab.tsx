import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare const initialModel: WorkspaceModel<{ kind: string }>;

// <begin>

import { useWorkspaceRef } from "react-resizable-panels";

function App() {
  const workspaceRef = useWorkspaceRef<{ kind: string }>();

  return (
    <>
      <button onClick={() => workspaceRef.current?.selectTab("counter")}>
        Show counter
      </button>
      <Workspace
        defaultModel={initialModel}
        renderTabContent={(tab) => <div>{tab.data.kind}</div>}
        workspaceRef={workspaceRef}
      />
    </>
  );
}

// <end>

export { App };
