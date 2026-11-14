import { Workspace, type WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "chart" | "editor" | "log" };

declare function TabContent(props: { kind: string }): null;
declare const initialModel: WorkspaceModel<TabData>;

// <begin>

/* prettier-ignore */
<Workspace<TabData>
  defaultModel={initialModel}
  lazyTabContent={(tab) => tab.data.kind === "chart"}
  hiddenTabBehavior={(tab) => (tab.data.kind === "log" ? "unmount" : "keep-mounted")}
  renderTabContent={(tab) => <TabContent kind={tab.data.kind} />}
/>;
