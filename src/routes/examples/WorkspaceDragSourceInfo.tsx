import { Workspace, type WorkspaceModel } from "react-resizable-panels";

type SourceInfo = { app: string; schemaVersion: number };
type TabData = { kind: string; schemaVersion: number };

declare function TabContent(props: { data: TabData }): null;
declare const initialModel: WorkspaceModel<TabData>;
declare function migrateTabData(data: TabData): TabData;
declare function notify(message: string): void;

// <begin>

/* prettier-ignore */
<Workspace<TabData>
  defaultModel={initialModel}
  dragGroup="dashboards"
  dragSourceInfo={{ app: "reports", schemaVersion: 3 } satisfies SourceInfo}
  disableDrop={({ source, sourceInfo }) =>
    source === "external" && (sourceInfo as SourceInfo | undefined)?.app !== "reports"
  }
  onModelChanged={(_, { reason, sourceInfo }) => {
    const info = sourceInfo as SourceInfo | undefined;
    if (reason === "transfer" && info && info.schemaVersion < 3) {
      notify(`Tab moved in from an older version of ${info.app}`);
    }
  }}
  renderTabContent={(tab) => <TabContent data={migrateTabData(tab.data)} />}
/>;
