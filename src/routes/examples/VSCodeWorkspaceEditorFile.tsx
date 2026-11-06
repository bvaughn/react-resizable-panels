import type { ReactNode } from "react";
import type { TabNode, WorkspaceModel } from "react-resizable-panels";

type TabData = { kind: "file" | "view"; name: string };

declare const model: WorkspaceModel<TabData>;
declare function Editor(props: { file: string }): ReactNode;
declare function SideView(props: { view: string }): ReactNode;

// <begin>

import { Workspace } from "react-resizable-panels";

export function App() {
  return (
    <Workspace
      defaultModel={model}
      renderTabContent={(tab: TabNode<TabData>) =>
        tab.data.kind === "file" ? (
          <Editor file={tab.data.name} />
        ) : (
          <SideView view={tab.data.name} />
        )
      }
    />
  );
}
