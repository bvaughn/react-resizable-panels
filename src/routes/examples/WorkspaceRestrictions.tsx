import { Workspace } from "react-resizable-panels";
import { findTabset, initialModel } from "./WorkspaceRestrictionsModel";

declare function TabContent(props: { kind: string }): null;
declare const isLocked: boolean;

// <begin>

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  disabled={isLocked}
  disableDrop={({ model, target }) => {
    // Drops at the edges of the workspace (beside all of the tabsets) have no tabset
    if ("edge" in target) {
      return false;
    }

    const tabset = findTabset(model.root, target.tabsetId);
    return tabset?.data?.acceptsDrops === false;
  }}
  renderTabContent={(tab) => <TabContent kind={tab.data.kind} />}
/>;
