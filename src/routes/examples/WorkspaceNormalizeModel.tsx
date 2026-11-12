import {
  normalizeWorkspaceModel,
  type TabNode,
  type WorkspaceModel
} from "react-resizable-panels";

type TabData = { kind: "files" | "search" | "terminal" };

declare const STORAGE_KEY: string;
declare function createDefaultModel(): WorkspaceModel<TabData>;

// <begin>

const tabsById = new Map<string, TabNode<TabData>>([
  ["files", { id: "files", title: "Files", data: { kind: "files" } }],
  ["search", { id: "search", title: "Search", data: { kind: "search" } }],
  [
    "terminal",
    {
      id: "terminal",
      title: "Terminal",
      data: { kind: "terminal" },
      disableClose: true
    }
  ]
]);

function loadModel(): WorkspaceModel<TabData> {
  let saved: unknown;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    saved = null;
  }

  const model = normalizeWorkspaceModel<TabData>(saved, {
    mapTab: (tab) => tabsById.get(tab.id) ?? null
  });

  return model ?? createDefaultModel();
}

// <end>

export { loadModel };
