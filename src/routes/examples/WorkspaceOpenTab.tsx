import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare function FileTree(props: { onOpen: (path: string) => void }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

import { useWorkspaceRef } from "react-resizable-panels";

function App() {
  const workspaceRef = useWorkspaceRef<{ path: string }>();

  const openFile = (path: string) =>
    workspaceRef.current?.addTab({
      data: { path },
      id: path,
      title: path.split("/").pop()
    });

  return (
    <>
      <FileTree onOpen={openFile} />
      <Workspace
        defaultModel={initialModel}
        renderTabContent={(tab) => <Editor path={tab.data.path} />}
        workspaceRef={workspaceRef}
      />
    </>
  );
}

// <end>

export { App };
