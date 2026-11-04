// <begin>

import type { WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "about" | "counter" | "nested" | "notes" };

const maxSizeModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        // The sidebar can be resized, but only within these limits
        minWidth: "150px",
        maxWidth: "300px",
        size: "200px",
        // Neither the sidebar nor its tab can be dragged or closed
        disableDrag: true,
        tabs: [
          {
            id: "about",
            title: "About",
            data: { kind: "about" },
            disableClose: true,
            disableDrag: true
          }
        ]
      },
      {
        type: "tabset",
        id: "editors",
        tabs: [
          { id: "counter", title: "Counter", data: { kind: "counter" } },
          { id: "notes", title: "Notes", data: { kind: "notes" } }
        ]
      }
    ]
  }
};

// <end>

export { maxSizeModel, type TabData };
