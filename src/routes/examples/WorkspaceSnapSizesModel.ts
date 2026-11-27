// <begin>

import type { WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "about" | "counter" | "nested" | "notes" };

const snapSizesModel: WorkspaceModel<TabData> = {
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
        snapWidths: [25, 50, 75],
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
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

export { snapSizesModel, type TabData };
