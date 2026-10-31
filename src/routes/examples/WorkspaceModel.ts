// <begin>

import type { WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "about" | "counter" | "nested" | "notes" };

const initialModel: WorkspaceModel<TabData> = {
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
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
      },
      {
        type: "split",
        id: "main",
        orientation: "vertical",
        size: 75,
        children: [
          {
            type: "tabset",
            id: "editors",
            size: 65,
            tabs: [
              { id: "counter", title: "Counter", data: { kind: "counter" } },
              { id: "notes", title: "Notes", data: { kind: "notes" } },
              { id: "nested", title: "Nested panels", data: { kind: "nested" } }
            ]
          },
          {
            type: "tabset",
            id: "bottom",
            size: 35,
            tabs: [
              { id: "scratchpad", title: "Scratchpad", data: { kind: "notes" } }
            ]
          }
        ]
      }
    ]
  }
};

// <end>

export { initialModel, type TabData };
