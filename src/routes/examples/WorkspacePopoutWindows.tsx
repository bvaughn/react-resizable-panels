import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useWorkspaceRef,
  Workspace,
  type TabNode,
  type WorkspaceModel
} from "react-resizable-panels";

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<{ path: string }>;

// <begin>

type TabData = { path: string };
type Popout = {
  container: HTMLElement;
  id: number;
  model: WorkspaceModel<TabData>;
  popup: Window;
};

let nextPopoutId = 0;

function App() {
  const workspaceRef = useWorkspaceRef<TabData>();
  const [popouts, setPopouts] = useState<Popout[]>([]);

  // Tabs left in a popout window when it's closed are moved back
  const closePopout = ({ id, popup }: Popout, tabs: TabNode<TabData>[]) => {
    setPopouts((prev) => prev.filter((popout) => popout.id !== id));
    tabs.forEach((tab) => workspaceRef.current?.addTab(tab));
    popup.close();
  };

  return (
    <>
      <Workspace
        defaultModel={initialModel}
        onTearOff={({ height, model, screenX, screenY, width }) => {
          // Opened while the pointer's release is handled, so it isn't blocked as an unrequested popup
          const popup = window.open(
            "",
            "",
            `left=${screenX},top=${screenY},width=${width},height=${height}`
          );
          if (!popup) {
            // Blocked anyway; keep the tab where it was
            return false;
          }

          // The popup starts out blank, so the app's styles are copied into it
          for (const element of document.querySelectorAll(
            "link[rel=stylesheet], style"
          )) {
            popup.document.head.append(element.cloneNode(true));
          }

          // Created by the popup's document, so that the workspace belongs to the popup window
          const container = popup.document.createElement("div");
          popup.document.body.append(container);

          const id = nextPopoutId++;
          setPopouts((prev) => [...prev, { container, id, model, popup }]);
          return true;
        }}
        renderDragPreview={(tab, { isTearOff }) =>
          isTearOff ? `Open ${tab.title} in a new window` : tab.title
        }
        renderTabContent={(tab) => <Editor path={tab.data.path} />}
        workspaceRef={workspaceRef}
      />
      {popouts.map((popout) => (
        <PopoutWindow
          key={popout.id}
          onClose={(tabs) => closePopout(popout, tabs)}
          popout={popout}
        />
      ))}
    </>
  );
}

function PopoutWindow({
  onClose,
  popout: { container, model, popup }
}: {
  onClose: (tabs: TabNode<TabData>[]) => void;
  popout: Popout;
}) {
  const workspaceRef = useWorkspaceRef<TabData>();

  useEffect(() => {
    const onPageHide = () => {
      const model = workspaceRef.current?.getModel();
      onClose(model ? getAllTabs(model.root) : []);
    };

    popup.addEventListener("pagehide", onPageHide);
    return () => popup.removeEventListener("pagehide", onPageHide);
  });

  return createPortal(
    <Workspace
      defaultModel={model}
      onModelChanged={(model) => {
        // Closed once its last tab is closed
        if (getAllTabs(model.root).length === 0) {
          onClose([]);
        }
      }}
      renderTabContent={(tab) => <Editor path={tab.data.path} />}
      style={{ height: "100vh" }}
      workspaceRef={workspaceRef}
    />,
    container
  );
}

function getAllTabs(node: WorkspaceModel<TabData>["root"]): TabNode<TabData>[] {
  return node.type === "tabset" ? node.tabs : node.children.flatMap(getAllTabs);
}

// <end>

export { App };
