import { Workspace, type WorkspaceModel } from "react-resizable-panels";

type TabData = { isDirty: boolean; kind: string };

declare function TabContent(props: { kind: string }): null;
declare const initialModel: WorkspaceModel<TabData>;
declare const isLocked: boolean;

// <begin>

/* prettier-ignore */
<Workspace<TabData>
  defaultModel={initialModel}
  onBeforeModelChange={({ reason, removedTabs }) => {
    if (isLocked) {
      return ["select", "expand", "raise", "maximize", "restore"].includes(reason);
    }

    return !removedTabs.some((tab) => tab.data.isDirty);
  }}
  renderTabContent={(tab) => <TabContent kind={tab.data.kind} />}
/>;
