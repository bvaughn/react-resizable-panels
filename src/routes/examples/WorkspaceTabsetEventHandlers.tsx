import { type MouseEvent } from "react";
import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare const initialModel: WorkspaceModel;
declare function openTabsetMenu(tabsetId: string, event: MouseEvent): void;

// <begin>

// Handlers are attached to the Workspace and find the tabset (and its id) from the event's target
function onContextMenu(event: MouseEvent<HTMLDivElement>) {
  const header = (event.target as Element).closest("[data-tabset-header]");
  const tabset = header?.closest("[data-tabset-id]");

  // Workspaces within tabs are inside of this one; ignore their tabsets
  if (tabset && tabset.closest("[data-workspace]") === event.currentTarget) {
    event.preventDefault();
    openTabsetMenu(tabset.getAttribute("data-tabset-id")!, event);
  }
}

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  onContextMenu={onContextMenu}
  renderTabContent={() => null}
/>;

// <end>
