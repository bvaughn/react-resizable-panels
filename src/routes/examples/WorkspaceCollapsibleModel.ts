// <begin>

import type { WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "about" | "counter" | "nested" | "notes" };

const collapsibleModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        collapsible: true,
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
            tabs: [
              { id: "counter", title: "Counter", data: { kind: "counter" } },
              { id: "notes", title: "Notes", data: { kind: "notes" } }
            ]
          },
          {
            type: "tabset",
            id: "bottom",
            collapsible: true,
            collapsed: true,
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

export { collapsibleModel, type TabData };
