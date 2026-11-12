import {
  usePopoutWindows,
  useWorkspaceRef,
  Workspace,
  type WorkspaceModel
} from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

type TabData = { path: string };

function App() {
  const workspaceRef = useWorkspaceRef<TabData>();
  const popouts = usePopoutWindows({ workspaceRef });

  return (
    <>
      <Workspace
        defaultModel={initialModel}
        dragGroup="editor"
        onTearOff={popouts.onTearOff}
        renderTabContent={(tab) => <Editor path={tab.data.path} />}
        workspaceRef={workspaceRef}
      />
      {popouts.render((props) => (
        <Workspace
          {...props}
          dragGroup="editor"
          renderTabContent={(tab) => <Editor path={tab.data.path} />}
          style={{ height: "100vh" }}
        />
      ))}
    </>
  );
}

// <end>

export { App };
