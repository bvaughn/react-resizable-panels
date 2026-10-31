import type { WorkspaceModel } from "react-resizable-panels";

declare const sidebarTabs: never[];
declare const editorTabs: never[];

// <begin>

const model: WorkspaceModel = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        size: 25,
        tabPlacement: "left",
        tabs: sidebarTabs
      },
      {
        type: "tabset",
        id: "editors",
        // Tabsets without a tabPlacement use the Workspace's tabPlacement prop
        tabs: editorTabs
      }
    ]
  }
};

// <end>

export { model };
