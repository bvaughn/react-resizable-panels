import { Workspace, type WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "docs" | "editor"; path: string };

declare function Docs(props: { path: string }): null;
declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<TabData>;

// <begin>

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  renderTabContent={(tab) =>
    tab.data.kind === "docs" ? (
      <Docs path={tab.data.path} />
    ) : (
      <Editor path={tab.data.path} />
    )
  }
  // Server render static documentation, but not editors
  serverRenderTabContent={(tab) => tab.data.kind === "docs"}
/>
