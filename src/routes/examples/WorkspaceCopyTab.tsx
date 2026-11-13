import { Workspace, type WorkspaceModel } from "react-resizable-panels";

type Chart = { symbol: string; interval: string };

declare function ChartContent(props: { chart: Chart }): null;
declare const initialModel: WorkspaceModel<Chart>;

// <begin>

<Workspace
  copyTab={(tab) => ({ ...tab, id: crypto.randomUUID() })}
  copyTabset={(tabset, copyTab) => ({
    ...tabset,
    id: crypto.randomUUID(),
    tabs: tabset.tabs.map(copyTab)
  })}
  defaultModel={initialModel}
  renderTabContent={(tab) => <ChartContent chart={tab.data} />}
/>;

// <end>
