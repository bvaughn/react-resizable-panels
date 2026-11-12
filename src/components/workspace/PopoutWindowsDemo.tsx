import {
  usePopoutWindows,
  useWorkspaceRef,
  type WorkspaceModel
} from "react-resizable-panels";
import { type DemoTab, DemoWorkspace } from "./WorkspaceDemo";

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

/**
 * The workspace on the popout windows page: tabs (and tabsets) dropped outside of the window are opened in popup windows,
 * and moved back when those windows are closed (see the WorkspacePopoutWindows example).
 */
export function PopoutWindowsDemo() {
  const workspaceRef = useWorkspaceRef<DemoTab>();
  const popouts = usePopoutWindows({
    onOpen: ({ container, window }) => {
      window.document.title = "Popout window";
      container.className = "h-screen p-2";
    },
    workspaceRef
  });

  return (
    <>
      <DemoWorkspace
        className="h-80"
        defaultModel={initialModel}
        // Tabs can be dragged between this window and the popups
        dragGroup={DRAG_GROUP}
        onPopOut={(tabset, tab) => {
          // Opened by a click (rather than at the end of a drag), which every browser allows
          const rect = document
            .querySelector(`[data-tabset-id="${tabset.id}"]`)
            ?.getBoundingClientRect();
          const isOpened = popouts.open(
            {
              root: { selectedId: tab.id, tabs: [tab], type: "tabset" },
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
        onTearOff={popouts.onTearOff}
        renderDragPreview={(tab, { isTearOff }) =>
          isTearOff ? `Open ${tab.title} in a new window` : tab.title
        }
        showResetButton
        workspaceRef={workspaceRef}
      />
      {popouts.render((props) => (
        <DemoWorkspace
          {...props}
          // The container is the height of the popup, minus its padding
          className="h-[calc(100vh-1rem)]"
          dragGroup={DRAG_GROUP}
        />
      ))}
    </>
  );
}
