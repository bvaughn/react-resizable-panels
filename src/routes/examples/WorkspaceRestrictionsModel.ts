import type {
  TabsetNode,
  WorkspaceModel,
  WorkspaceNode
} from "react-resizable-panels";

// <begin>

type TabData = { kind: "counter" | "notes" | "pinned" };
type TabsetData = { acceptsDrops: boolean };

const initialModel: WorkspaceModel<TabData, TabsetData> = {
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
        // Other tabs can't be dropped into this tabset (see disableDrop below)
        data: { acceptsDrops: false },
        tabs: [
          {
            id: "pinned",
            title: "Pinned",
            data: { kind: "pinned" },
            disableClose: true,
            disableDrag: true
          }
        ]
      },
      {
        type: "tabset",
        id: "editors",
        size: 70,
        data: { acceptsDrops: true },
        tabs: [
          { id: "counter", title: "Counter", data: { kind: "counter" } },
          { id: "notes", title: "Notes", data: { kind: "notes" } }
        ]
      }
    ]
  }
};

// <end>

function findTabset<TD, TSD>(
  node: WorkspaceNode<TD, TSD>,
  id: string
): TabsetNode<TD, TSD> | undefined {
  if (node.type === "tabset") {
    return node.id === id ? node : undefined;
  }
  for (const child of node.children) {
    const match = findTabset(child, id);
    if (match) {
      return match;
    }
  }
}

export { findTabset, initialModel, type TabData, type TabsetData };
