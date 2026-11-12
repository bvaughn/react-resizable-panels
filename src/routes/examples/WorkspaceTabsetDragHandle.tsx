import {
  TabsetDragHandle,
  Workspace,
  type WorkspaceModel
} from "react-resizable-panels";

type TabData = { kind: "about" | "counter" | "nested" | "notes" };

declare function TabContent(props: { kind: TabData["kind"] }): null;
declare const initialModel: WorkspaceModel<TabData>;

// <begin>

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  renderTabContent={(tab) => <TabContent kind={tab.data.kind} />}
  renderTabsetToolbar={() => (
    <TabsetDragHandle className="drag-handle">⠿</TabsetDragHandle>
  )}
/>
