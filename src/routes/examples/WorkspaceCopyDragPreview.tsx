import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function Content(): null;
declare const initialModel: WorkspaceModel;

// <begin>

<Workspace
  defaultModel={initialModel}
  renderDragPreview={(tab, { isCopy }) =>
    isCopy ? `${tab.title} (copy)` : tab.title
  }
  renderTabsetDragPreview={(tabset, { isCopy }) => {
    const label = `${tabset.tabs.length} tabs`;
    return isCopy ? `${label} (copy)` : label;
  }}
  renderTabContent={() => <Content />}
/>;

// <end>
