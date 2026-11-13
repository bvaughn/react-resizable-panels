import {
  usePopoutWindows,
  useWorkspaceRef,
  Workspace,
  type PopoutWindowState,
  type WorkspaceModel
} from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

type TabData = { path: string };

function loadModel(): WorkspaceModel<TabData> {
  const stored = localStorage.getItem("model");
  return stored ? JSON.parse(stored) : initialModel;
}

function App() {
  const workspaceRef = useWorkspaceRef<TabData>();
  const popouts = usePopoutWindows({
    onCloseAll: (state) =>
      localStorage.setItem("popouts", JSON.stringify(state)),
    workspaceRef
  });

  const restore = () => {
    const saved: PopoutWindowState<TabData>[] = JSON.parse(
      localStorage.getItem("popouts") ?? "[]"
    );
    const blocked = saved.filter(
      ({ model, rect }) => !popouts.open(model, rect)
    );
    if (blocked.length > 0) {
      localStorage.setItem("popouts", JSON.stringify(blocked));
    } else {
      localStorage.removeItem("popouts");
    }
  };

  return (
    <>
      <button onClick={restore}>Reopen windows</button>
      <Workspace
        defaultModel={loadModel()}
        onModelChanged={(model) =>
          localStorage.setItem("model", JSON.stringify(model))
        }
        dragGroup="editor"
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
