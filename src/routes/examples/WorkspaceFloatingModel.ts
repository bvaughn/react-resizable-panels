// <begin>

import type { WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "about" | "counter" | "notes" };

const floatingModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        size: 30,
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
      },
      {
        type: "tabset",
        id: "editors",
        size: 70,
        tabs: [{ id: "counter", title: "Counter", data: { kind: "counter" } }]
      }
    ]
  },
  // Floats above the layout; positions and sizes are in pixels,
  // relative to the top left corner of the layout
  floating: [
    {
      type: "tabset",
      id: "notepad",
      x: 360,
      y: 60,
      width: 280,
      height: 200,
      tabs: [{ id: "notes", title: "Notes", data: { kind: "notes" } }]
    }
  ]
};

// <end>

export { floatingModel };
