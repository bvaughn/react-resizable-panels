import { type WorkspaceImperativeHandle } from "react-resizable-panels";

declare const workspace: WorkspaceImperativeHandle<{ path: string }>;
declare const tab: Parameters<typeof workspace.addTab>[0];

// <begin>

// In a new tabset below the "grid" tabset, taking 30% of the split it's in
workspace.addTab(tab, {
  size: "30%",
  target: { region: "bottom", tabsetId: "grid" }
});

// In a new tabset along the bottom of the workspace, 200 pixels tall
workspace.addTab(tab, { size: "200px", target: { edge: "bottom" } });

// <end>
