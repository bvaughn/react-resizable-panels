import { Workspace, type WorkspaceModel } from "react-resizable-panels";

type TabData = { path: string };

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<TabData>;

// <begin>

const STORAGE_KEY = "my-app:workspace";

function loadModel(): WorkspaceModel<TabData> | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : undefined;
  } catch {
    // Fall back to the initial model (e.g. if the saved model is corrupt)
  }
}

function saveModel(model: WorkspaceModel<TabData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
}

/* prettier-ignore */
<Workspace
  defaultModel={loadModel() ?? initialModel}
  onModelChanged={saveModel}
  renderTabContent={(tab) => <Editor path={tab.data.path} />}
/>;

// <end>

export { loadModel, saveModel };
