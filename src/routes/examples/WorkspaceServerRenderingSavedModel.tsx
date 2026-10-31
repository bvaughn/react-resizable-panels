import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

// The server reads the saved model (e.g. from a cookie) and passes it to the app,
// so the server and client render the same layout
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
