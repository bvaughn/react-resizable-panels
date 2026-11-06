import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  type TabNode,
  type WorkspaceModel,
  type WorkspaceNode,
  useWorkspaceRef
} from "react-resizable-panels";
import { type DemoTab, DemoWorkspace } from "./WorkspaceDemo";

type Popout = {
  container: HTMLElement;
  id: number;
  model: WorkspaceModel<DemoTab>;
  popup: Window;
};

const DRAG_GROUP = "popout-windows";

// The counter and scratchpad keep their values in their tabs' data, so they survive being moved to a popup
const initialModel: WorkspaceModel<DemoTab> = {
  root: {
    children: [
      {
        id: "left",
        size: 50,
        tabs: [
          { data: { kind: "about-popouts" }, id: "about", title: "About" }
        ],
        type: "tabset"
      },
      {
        id: "right",
        size: 50,
        tabs: [
          {
            data: { count: 0, kind: "saved-counter" },
            id: "counter",
            title: "Counter"
          },
          {
            data: { kind: "saved-notes", text: "" },
            id: "scratchpad",
            title: "Scratchpad"
          }
        ],
        type: "tabset"
      }
    ],
    id: "root",
    orientation: "horizontal",
    type: "split"
  },
  version: 1
};

let nextPopoutId = 0;

/**
 * The workspace on the popout windows page: tabs (and tabsets) dropped outside of the window are opened in popup windows,
 * and moved back when those windows are closed (see the WorkspacePopoutWindows example).
 */
export function PopoutWindowsDemo() {
  const workspaceRef = useWorkspaceRef<DemoTab>();
  const [popouts, setPopouts] = useState<Popout[]>([]);

  // Popups are closed when the page is left (or the route is changed), since their content is rendered by this page
  const popoutsRef = useRef(popouts);
  useEffect(() => {
    popoutsRef.current = popouts;
  });
  useEffect(() => {
    const closeAll = () =>
      popoutsRef.current.forEach(({ popup }) => popup.close());

    window.addEventListener("pagehide", closeAll);
    return () => {
      window.removeEventListener("pagehide", closeAll);
      closeAll();
    };
  }, []);

  const openPopout = (
    model: WorkspaceModel<DemoTab>,
    {
      height,
      screenX,
      screenY,
      width
    }: { height: number; screenX: number; screenY: number; width: number }
  ) => {
    const popup = window.open(
      "",
      "",
      `left=${screenX},top=${screenY},width=${Math.round(width)},height=${Math.round(height)}`
    );
    if (!popup) {
      return false;
    }

    popup.document.title = "Popout window";
    for (const element of document.querySelectorAll(
      "link[rel=stylesheet], style"
    )) {
      popup.document.head.append(element.cloneNode(true));
    }

    const container = popup.document.createElement("div");
    container.className = "h-screen p-2";
    popup.document.body.append(container);

    const id = nextPopoutId++;
    setPopouts((prev) => [...prev, { container, id, model, popup }]);
    return true;
  };

  const closePopout = ({ id, popup }: Popout, tabs: TabNode<DemoTab>[]) => {
    setPopouts((prev) => prev.filter((popout) => popout.id !== id));
    tabs.forEach((tab) => workspaceRef.current?.addTab(tab));
    popup.close();
  };

  return (
    <>
      <DemoWorkspace
        className="h-80"
        defaultModel={initialModel}
        // Tabs can be dragged between this window and the popups
        dragGroup={DRAG_GROUP}
        onPopOut={(tabset, tab) => {
          // Opened by a click (rather than at the end of a drag), which every browser allows
          const element = document.querySelector(
            `[data-tabset-id="${tabset.id}"]`
          );
          const rect = element?.getBoundingClientRect();
          const isOpened = openPopout(
            {
              root: {
                id: `popout-${nextPopoutId}`,
                selectedId: tab.id,
                tabs: [tab],
                type: "tabset"
              },
              version: 1
            },
            {
              height: rect?.height ?? 320,
              screenX: window.screenX + (rect?.left ?? 0),
              screenY: window.screenY + (rect?.top ?? 0),
              width: rect?.width ?? 480
            }
          );
          if (isOpened) {
            workspaceRef.current?.closeTab(tab.id);
          }
        }}
        onTearOff={({ model, ...bounds }) => openPopout(model, bounds)}
        renderDragPreview={(tab, { isTearOff }) =>
          isTearOff ? `Open ${tab.title} in a new window` : tab.title
        }
        showResetButton
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
  onClose: (tabs: TabNode<DemoTab>[]) => void;
  popout: Popout;
}) {
  const workspaceRef = useWorkspaceRef<DemoTab>();

  useEffect(() => {
    const onPageHide = () => {
      const model = workspaceRef.current?.getModel();
      onClose(model ? getAllTabs(model.root) : []);
    };

    popup.addEventListener("pagehide", onPageHide);
    return () => popup.removeEventListener("pagehide", onPageHide);
  });

  return createPortal(
    <DemoWorkspace
      // The container is the height of the popup, minus its padding
      className="h-[calc(100vh-1rem)]"
      defaultModel={model}
      dragGroup={DRAG_GROUP}
      onModelChanged={(model) => {
        if (getAllTabs(model.root).length === 0) {
          onClose([]);
        }
      }}
      workspaceRef={workspaceRef}
    />,
    container
  );
}

function getAllTabs(node: WorkspaceNode<DemoTab>): TabNode<DemoTab>[] {
  return node.type === "tabset" ? node.tabs : node.children.flatMap(getAllTabs);
}
