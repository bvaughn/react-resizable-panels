import { Workspace, type WorkspaceModel } from "react-resizable-panels";

declare function FileContent(props: { file: File }): null;
declare const initialModel: WorkspaceModel<{ file: File }>;

// <begin>

function App() {
  return (
    <Workspace
      acceptExternalDrop={{
        types: ["Files"],
        createTab: (dataTransfer) => {
          const file = dataTransfer.files[0];

          return file
            ? { data: { file }, id: crypto.randomUUID(), title: file.name }
            : null;
        }
      }}
      defaultModel={initialModel}
      renderTabContent={(tab) => <FileContent file={tab.data.file} />}
    />
  );
}

// <end>

export { App };
