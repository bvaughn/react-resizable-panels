import { createPortal } from "react-dom";
import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;
declare const popouts: {
  container: HTMLElement;
  id: number;
  model: WorkspaceModel<{ path: string }>;
}[];

// <begin>

<>
  <Workspace
    // Workspaces with the same group can drag tabs to each other
    dragGroup="editor"
    defaultModel={initialModel}
    renderTabContent={(tab) => <Editor path={tab.data.path} />}
  />
  {popouts.map(({ container, id, model }) =>
    createPortal(
      <Workspace
        dragGroup="editor"
        defaultModel={model}
        renderTabContent={(tab) => <Editor path={tab.data.path} />}
      />,
      container,
      id
    )
  )}
</>;

// <end>
