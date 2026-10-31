import {
  TabCloseButton,
  useParentTabset,
  useParentTabsetState,
  Workspace,
  type WorkspaceModel
} from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare function FileIcon(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  renderEmptyTabset={() => "Add tabs here"}
  renderTab={(tab, props) => (
    <div {...props}>
      <FileIcon path={tab.data.path} />
      {tab.title}
      <TabCloseButton />
    </div>
  )}
  renderTabContent={(tab) => <Editor path={tab.data.path} />}
  renderTabsetToolbar={() => <MaximizeButton />}
/>

function MaximizeButton() {
  const tabset = useParentTabset();
  const state = useParentTabsetState();

  return state?.isMaximized ? (
    <button onClick={() => tabset?.restore()}>Restore</button>
  ) : (
    <button onClick={() => tabset?.maximize()}>Maximize</button>
  );
}

// <end>

export { MaximizeButton };
