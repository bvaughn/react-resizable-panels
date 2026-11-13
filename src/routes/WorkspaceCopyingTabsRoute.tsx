import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import type { WorkspaceModel } from "react-resizable-panels";
import { html as CopyDragPreviewHTML } from "../../public/generated/examples/WorkspaceCopyDragPreview.json";
import { html as CopyTabHTML } from "../../public/generated/examples/WorkspaceCopyTab.json";
import { Link } from "../components/Link";
import {
  type DemoTab,
  DemoWorkspace
} from "../components/workspace/WorkspaceDemo";

const defaultModel: WorkspaceModel<DemoTab> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "left",
        selectedId: "counter",
        tabs: [
          {
            data: { count: 3, kind: "saved-counter" },
            id: "counter",
            title: "Counter"
          },
          {
            data: { kind: "saved-notes", text: "Copies keep their notes" },
            id: "notes",
            title: "Notes"
          }
        ]
      },
      {
        type: "tabset",
        id: "right",
        selectedId: "about",
        tabs: [{ data: { kind: "about" }, id: "about", title: "About" }]
      }
    ]
  }
};

function createId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export default function WorkspaceCopyingTabsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Copying tabs" />
      <div>
        Dragging a tab moves it. With the <code>copyTab</code> prop, users can
        drop a copy instead (e.g. a second chart with the same settings) by
        holding the copy key while dragging. The <code>copyTabset</code> prop
        does the same for tabsets (dragged by their headers):
      </div>
      <Code html={CopyTabHTML} />
      <DemoWorkspace
        className="h-80"
        copyTab={(tab) => ({ ...tab, id: createId() })}
        copyTabset={(tabset, copyTab) => ({
          ...tabset,
          id: createId(),
          tabs: tabset.tabs.map(copyTab)
        })}
        defaultModel={defaultModel}
        renderDragPreview={(tab, { isCopy }) =>
          isCopy ? `${tab.title} (copy)` : tab.title
        }
        renderTabsetDragPreview={(tabset, { isCopy }) => {
          const label = `${tabset.tabs.length} tabs`;
          return isCopy ? `${label} (copy)` : label;
        }}
        showResetButton
      />
      <Callout>
        The copy key is <code>⌥</code> on macOS and <code>ctrl</code> on other
        platforms.
      </Callout>
      <SectionHeader>Making copies</SectionHeader>
      <div>
        A copy needs an id that isn't used by any other tab or tabset in the
        workspace. Copies with ids that are already in use are rejected (with a
        warning during development), and the tab is moved instead, as it is when{" "}
        <code>copyTab</code> returns <code>null</code>. Both props are called
        with where the copy will be dropped, so some targets can move tabs
        rather than copy them.
      </div>
      <div>
        <code>copyTabset</code> returns the whole copy, including its tabs; its{" "}
        <code>copyTab</code> argument copies a tab with the <code>copyTab</code>{" "}
        prop (or, without it, as a shallow copy with a new id). The copy's
        selected tab is the copy of the dragged tabset's selected tab.
      </div>
      <div>
        Copies are reported to <code>onModelChanged</code> with the{" "}
        <code>"copy"</code> reason, and the <code>disableDrop</code> prop is
        told whether a copy would be dropped (<code>isCopy</code>), e.g. to only
        allow copies in some tabsets (see{" "}
        <Link to="/examples/workspace/restrictions">restrictions</Link>).
      </div>
      <SectionHeader>Showing that a drag copies</SectionHeader>
      <div>
        The <code>renderDragPreview</code> and{" "}
        <code>renderTabsetDragPreview</code> props are told whether dropping
        would add a copy (<code>isCopy</code>):
      </div>
      <Code html={CopyDragPreviewHTML} />
      <div>
        The drag preview and the drop indicator also have a{" "}
        <code>data-drag-copy</code> attribute then, for styling.
      </div>
      <SectionHeader>Between workspaces</SectionHeader>
      <div>
        Tabs dragged between workspaces with the same{" "}
        <Link to="/examples/workspace/multiple-windows">drag group</Link> are
        copied by the workspace they're dropped into, so it needs the{" "}
        <code>copyTab</code> prop (the workspace they're dragged from doesn't
        change). In other copies of your app, the copy is made from the tab data
        that was sent there.
      </div>
      <Callout>
        These drags use the browser's drag and drop, which shows the system's
        copy cursor while the copy key is held over a workspace that would copy.
      </Callout>
    </Box>
  );
}
