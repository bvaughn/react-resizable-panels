import { Workspace, type WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "about" | "counter" | "nested" | "notes" };

declare function TabContent(props: { kind: TabData["kind"] }): null;
declare function saveModel(model: WorkspaceModel<TabData>): void;
declare const initialModel: WorkspaceModel<TabData>;

// <begin>

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  onModelChanged={(model) => saveModel(model)}
  renderTabContent={(tab) => <TabContent kind={tab.data.kind} />}
  tabsetMinHeight="60px"
  tabsetMinWidth="120px"
/>
