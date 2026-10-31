import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  renderTabContent={(tab) => <Editor path={tab.data.path} />}
  tabPlacement="left"
/>;
