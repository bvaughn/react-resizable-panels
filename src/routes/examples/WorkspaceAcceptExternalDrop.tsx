import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function WidgetContent(props: { kind: string }): null;
declare const initialModel: WorkspaceModel<{ kind: string }>;

// <begin>

const WIDGET_TYPE = "application/x-my-widget";

function App() {
  return (
    <Workspace
      acceptExternalDrop={{
        types: [WIDGET_TYPE],
        createTab: (dataTransfer) => {
          const kind = dataTransfer.getData(WIDGET_TYPE);

          return kind
            ? { data: { kind }, id: crypto.randomUUID(), title: kind }
            : null;
        }
      }}
      defaultModel={initialModel}
      renderTabContent={(tab) => <WidgetContent kind={tab.data.kind} />}
    />
  );
}

// <end>

export { App };
