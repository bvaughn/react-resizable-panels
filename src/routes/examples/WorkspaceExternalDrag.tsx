import { Workspace, type WorkspaceModel } from "react-resizable-panels";

type Widget = { kind: string; title: string };

declare function WidgetContent(props: { kind: string }): null;
declare const initialModel: WorkspaceModel<{ kind: string }>;

// <begin>

import { useWorkspaceRef } from "react-resizable-panels";

function App({ widgets }: { widgets: Widget[] }) {
  const workspaceRef = useWorkspaceRef<{ kind: string }>();

  return (
    <>
      {widgets.map((widget) => (
        <button
          key={widget.kind}
          onPointerDown={(event) =>
            workspaceRef.current?.startExternalDrag(event, {
              tab: {
                data: { kind: widget.kind },
                id: crypto.randomUUID(),
                title: widget.title
              }
            })
          }
          style={{ touchAction: "none" }}
        >
          {widget.title}
        </button>
      ))}
      <Workspace
        defaultModel={initialModel}
        renderTabContent={(tab) => <WidgetContent kind={tab.data.kind} />}
        workspaceRef={workspaceRef}
      />
    </>
  );
}

// <end>

export { App };
