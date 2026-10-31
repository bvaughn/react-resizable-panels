import {
  useParentTabset,
  useParentTabsetState,
  Workspace,
  type WorkspaceModel
} from "react-resizable-panels";

declare function Editor(props: { path: string }): null;

// <begin>

const initialModel: WorkspaceModel<{ path: string }> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        size: 25,
        tabs: [
          /* ... */
        ]
      },
      {
        type: "tabset",
        id: "editors",
        // Stays (as a drop target) after its last tab is closed
        keepWhenEmpty: true,
        tabs: [
          /* ... */
        ]
      }
    ]
  }
};

function CloseTabsetButton() {
  const tabset = useParentTabset();
  const isRoot = useParentTabsetState()?.isRoot;

  // Closing the only tabset in a workspace would just close its tabs
  if (isRoot) {
    return null;
  }

  return <button onClick={() => tabset?.close()}>Close</button>;
}

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  renderEmptyTabset={() => "Add tabs here"}
  renderTabContent={(tab) => <Editor path={tab.data.path} />}
  renderTabsetToolbar={() => <CloseTabsetButton />}
/>;

// <end>

export { CloseTabsetButton };
