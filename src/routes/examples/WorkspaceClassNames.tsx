import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

/* prettier-ignore */
<Workspace
  classNames={{
    split: "split",
    tabset: "tabset",
    header: "tabset-header",
    tabList: "tab-list",
    tab: "tab",
    tabPanels: "tab-panels",
    tabContent: "tab-content"
  }}
  defaultModel={initialModel}
  renderTabContent={(tab) => <Editor path={tab.data.path} />}
  styles={{
    split: { gap: 4 },
    tabContent: { height: "100%", overflow: "auto" }
  }}
/>;

// <end>
