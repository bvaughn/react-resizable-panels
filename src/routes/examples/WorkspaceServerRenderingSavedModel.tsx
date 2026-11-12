import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

function App({
  savedModel
}: {
  savedModel: WorkspaceModel<{ path: string }> | undefined;
}) {
  return (
    <Workspace
      defaultModel={savedModel ?? initialModel}
      onModelChanged={(model) => {
        document.cookie = `workspace=${encodeURIComponent(
          JSON.stringify(model)
        )}; path=/; max-age=31536000`;
      }}
      renderTabContent={(tab) => <Editor path={tab.data.path} />}
    />
  );
}

// <end>

export { App };
