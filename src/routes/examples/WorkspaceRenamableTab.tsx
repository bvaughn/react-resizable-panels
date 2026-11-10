import { useState } from "react";
import {
  TabCloseButton,
  useParentWorkspace,
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
  const workspace = useParentWorkspace();
  const [isEditing, setIsEditing] = useState(false);

  const title = tab.title ?? tab.id;

  return (
    <div {...props} onDoubleClick={() => setIsEditing(true)}>
      {isEditing ? (
        // Inputs within a tab don't select or drag it
        <input
          autoFocus
          defaultValue={title}
          onBlur={(event) => {
            setIsEditing(false);

            const newTitle = event.currentTarget.value.trim();
            if (newTitle && newTitle !== title) {
              workspace?.updateTab(tab.id, { title: newTitle });
            }
          }}
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // Blurring the input commits the new title
              event.currentTarget.closest<HTMLElement>("[data-tab]")?.focus();
            } else if (event.key === "Escape") {
              event.currentTarget.value = title;
              event.currentTarget.closest<HTMLElement>("[data-tab]")?.focus();
            }
          }}
        />
      ) : (
        title
      )}
      <TabCloseButton />
    </div>
  );
}

// <end>

export { RenamableTab };
