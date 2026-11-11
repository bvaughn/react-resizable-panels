import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function WidgetContent(props: { kind: string }): null;
declare const initialModel: WorkspaceModel<{ kind: string }>;

// <begin>

// Any element (even in another application) can set this data when it starts a drag
const WIDGET_TYPE = "application/x-my-widget";

function App() {
  return (
    <Workspace
      acceptExternalDrop={{
        // Decides where the drop indicator is shown, since a drag's data can't be read until it's dropped
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
