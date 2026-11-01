import {
  Separator,
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
  renderSeparator={(orientation) => (
    <Separator className={`separator separator-${orientation}`} />
  )}
  renderTabContent={(tab) => <TabContent kind={tab.data.kind} />}
/>
