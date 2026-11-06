import type { WorkspaceModel } from "react-resizable-panels";
import {
  type DemoTab,
  DemoWorkspace
} from "../components/workspace/WorkspaceDemo";

// Tab ids must be unique within the drag group, so each copy's tabs have their own ids
const MODELS: Record<string, WorkspaceModel<DemoTab>> = {
  a: {
    root: {
      id: "a",
      selectedId: "a-about",
      tabs: [
        { data: { kind: "about-copies" }, id: "a-about", title: "About" },
        {
          data: { count: 0, kind: "saved-counter" },
          id: "a-counter",
          title: "Counter"
        }
      ],
      type: "tabset"
    },
    version: 1
  },
  b: {
    root: {
      id: "b",
      selectedId: "b-scratchpad",
      tabs: [
        {
          data: { kind: "saved-notes", text: "" },
          id: "b-scratchpad",
          title: "Scratchpad"
        }
      ],
      type: "tabset"
    },
    version: 1
  }
};

/**
 * A page with just a workspace, shown in iframes on the "Copies of your app" page;
 * each iframe loads its own copy of the app, so tabs dragged between them are sent between copies (see the Workspace's dragGroup prop).
 */
export default function DragBetweenAppsEmbed() {
  const copy = new URLSearchParams(location.search).get("copy") ?? "a";

  return (
    <div className="h-screen p-2">
      <DemoWorkspace
        // The container is the height of the page, minus its padding
        className="h-[calc(100vh-1rem)]"
        defaultModel={MODELS[copy] ?? MODELS.a}
        dragGroup="drag-between-apps"
      />
    </div>
  );
}
