import { type WorkspaceImperativeHandle } from "react-resizable-panels";

declare const workspace: WorkspaceImperativeHandle;

// <begin>

workspace.resizeSplit("root", { sidebar: 30, main: 70 });

workspace.resizeSplit("root", { sidebar: "250px" });

// <end>
