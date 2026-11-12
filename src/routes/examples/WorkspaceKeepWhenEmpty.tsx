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
