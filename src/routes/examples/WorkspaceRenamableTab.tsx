import {
  TabCloseButton,
  useTabRename,
  Workspace,
  type TabNode,
  type TabRenderProps,
  type WorkspaceModel
} from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

/* prettier-ignore */
<Workspace
  defaultModel={initialModel}
  renderTab={(tab, props) => <RenamableTab props={props} tab={tab} />}
  renderTabContent={(tab) => <Editor path={tab.data.path} />}
/>

function RenamableTab({ props, tab }: { props: TabRenderProps; tab: TabNode }) {
  const { inputProps, isEditing, startEditing } = useTabRename();

  return (
    <div
      {...props}
      onDoubleClick={startEditing}
      onKeyDown={(event) => {
        if (event.key === "F2" && event.target === event.currentTarget) {
          startEditing();
        } else {
          props.onKeyDown?.(event);
        }
      }}
    >
      {isEditing ? (
        <input aria-label="Tab title" {...inputProps} />
      ) : (
        (tab.title ?? tab.id)
      )}
      <TabCloseButton />
    </div>
  );
}

// <end>

export { RenamableTab };
