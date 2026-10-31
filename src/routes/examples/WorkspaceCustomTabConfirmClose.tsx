import {
  TabCloseButton,
  Workspace,
  type WorkspaceModel
} from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare function hasUnsavedChanges(path: string): boolean;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  renderTab={(tab, props) => {
    const confirmClose = () =>
      !hasUnsavedChanges(tab.data.path) || confirm("Discard unsaved changes?");

    return (
      <div
        {...props}
        onKeyDown={(event) => {
          // Delete and Backspace close the focused tab
          if ((event.key === "Delete" || event.key === "Backspace") && !confirmClose()) {
            return;
          }
          props.onKeyDown?.(event);
        }}
      >
        {tab.title}
        <TabCloseButton
          onClick={(event) => {
            if (!confirmClose()) {
              event.preventDefault();
            }
          }}
        />
      </div>
    );
  }}
  renderTabContent={(tab) => <Editor path={tab.data.path} />}
/>;

// <end>
