import {
  normalizeWorkspaceModel,
  type TabNode,
  type WorkspaceModel
} from "react-resizable-panels";

type TabData = { kind: "files" | "search" | "terminal" };

declare const STORAGE_KEY: string;
declare function createDefaultModel(): WorkspaceModel<TabData>;

// <begin>

// The tabs the app currently has (e.g. a tab may have been renamed or removed since the layout was saved)
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
    // Corrupt JSON is handled like a missing model
  }

  // Saved tabs are replaced with the current ones, and tabs that no longer exist are removed;
  // the layout is then tidied (e.g. tabsets left empty are removed)
  const model = normalizeWorkspaceModel<TabData>(saved, {
    mapTab: (tab) => tabsById.get(tab.id) ?? null
  });

  return model ?? createDefaultModel();
}

// <end>

export { loadModel };
