import { type WorkspaceImperativeHandle } from "react-resizable-panels";

declare const workspace: WorkspaceImperativeHandle<{ path: string }>;
declare const tab: Parameters<typeof workspace.addTab>[0];

// <begin>

workspace.addTab(tab, {
  size: "30%",
  target: { region: "bottom", tabsetId: "grid" }
});

workspace.addTab(tab, { size: "200px", target: { edge: "bottom" } });

// <end>
