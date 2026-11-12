import {
  usePopoutWindows,
  type WorkspaceImperativeHandle
} from "react-resizable-panels";

declare const workspaceRef: React.RefObject<WorkspaceImperativeHandle | null>;

function App() {
  // <begin>

  const popouts = usePopoutWindows({
    onOpen: ({ container, window }) => {
      window.document.title = "My app";
      container.style.height = "100vh";
    },
    workspaceRef
  });

  // <end>

  return popouts;
}

export { App };
