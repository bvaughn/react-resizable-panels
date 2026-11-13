import {
  type TabsetNode,
  usePopoutWindows,
  useWorkspaceRef,
  Workspace,
  type WorkspaceModel
} from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

type TabData = { path: string };

function App() {
  const workspaceRef = useWorkspaceRef<TabData>();
  const popouts = usePopoutWindows({ workspaceRef });

  const popOut = (tabset: TabsetNode<TabData>) => {
    const rect = document
      .querySelector(`[data-tabset-id="${tabset.id}"]`)
      ?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const isOpened = popouts.open(
      {
        root: {
          selectedId: tabset.selectedId,
          tabs: tabset.tabs,
          type: "tabset"
        },
        version: 1
      },
      {
        height: rect.height,
        screenX: window.screenX + rect.left,
        screenY: window.screenY + rect.top,
        width: rect.width
      }
    );
    if (isOpened) {
      workspaceRef.current?.closeTabset(tabset.id);
    }
  };

  return (
    <>
      <Workspace
        defaultModel={initialModel}
        dragGroup="editor"
        renderTabContent={(tab) => <Editor path={tab.data.path} />}
        renderTabsetToolbar={(tabset) =>
          tabset.tabs.length > 0 && (
            <button onClick={() => popOut(tabset)}>Pop out</button>
          )
        }
        workspaceRef={workspaceRef}
      />
      {popouts.render((props) => (
        <Workspace
          {...props}
          dragGroup="editor"
          renderTabContent={(tab) => <Editor path={tab.data.path} />}
          style={{ height: "100vh" }}
        />
      ))}
    </>
  );
}

// <end>

export { App };
