import { Workspace, type WorkspaceModelInput } from "react-resizable-panels";

declare function Widget(props: { kind: string }): null;

// <begin>

const defaultModel: WorkspaceModelInput<{ kind: string }> = {
  version: 1,
  root: {
    type: "split",
    orientation: "vertical",
    children: [
      {
        type: "tabset",
        size: "240px",
        tabs: [{ id: "chart", title: "Chart", data: { kind: "chart" } }]
      },
      {
        type: "tabset",
        size: "160px",
        tabs: [{ id: "log", title: "Log", data: { kind: "log" } }]
      }
    ]
  }
};

<div style={{ maxHeight: "80vh", overflow: "auto" }}>
  <Workspace
    defaultModel={defaultModel}
    growDirection="vertical"
    renderTabContent={(tab) => <Widget kind={tab.data.kind} />}
  />
</div>;

// <end>
