import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { useWorkspaceRef, type WorkspaceModel } from "react-resizable-panels";
import { html as UseParentTabsetHTML } from "../../public/generated/examples/UseParentTabset.json";
import { html as KeepWhenEmptyHTML } from "../../public/generated/examples/WorkspaceKeepWhenEmpty.json";
import { html as MaximizeTabsetHTML } from "../../public/generated/examples/WorkspaceMaximizeTabset.json";
import { html as OpenTabHTML } from "../../public/generated/examples/WorkspaceOpenTab.json";
import { html as UpdateTabHTML } from "../../public/generated/examples/WorkspaceUpdateTab.json";
import { DemoButton } from "../components/DemoButton";
import { Link } from "../components/Link";
import {
  type DemoTab,
  DemoWorkspace
} from "../components/workspace/WorkspaceDemo";
import { type TabData } from "./examples/WorkspaceModel";

const emptyModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: []
  }
};

// The editor area stays when its last tab is closed (see "Empty tabsets")
const keepWhenEmptyModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "sidebar",
        size: 30,
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
      },
      {
        type: "tabset",
        id: "editors",
        keepWhenEmpty: true,
        tabs: [
          { id: "counter", title: "Counter", data: { kind: "counter" } },
          { id: "notes", title: "Notes", data: { kind: "notes" } }
        ]
      }
    ]
  }
};

const FILES: (DemoTab & {
  id: string;
  title: string;
})[] = [
  { id: "notes", kind: "notes", title: "Notes" },
  { id: "about", kind: "about", title: "About" }
];

export default function WorkspaceManagingTabsRoute() {
  const workspaceRef = useWorkspaceRef<DemoTab>();

  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Managing tabs" />
      <div>
        Tabs are usually opened in response to something outside of the
        workspace (e.g. a file being selected in a tree). The{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>'s{" "}
        <code>addTab</code> method adds a tab to the active tabset (the one the
        user most recently interacted with) and selects it:
      </div>
      <Code html={OpenTabHTML} />
      <div>
        If a tab with the same id is already open (anywhere in the workspace),
        it's selected instead, and <code>addTab</code> returns{" "}
        <code>false</code>. Options can add the tab to a specific tabset (
        <code>tabsetId</code>) or position (<code>index</code>), or without
        selecting it (<code>select: false</code>).
      </div>
      <div className="flex flex-wrap gap-2">
        {FILES.map(({ id, kind, title }) => (
          <DemoButton
            key={id}
            onClick={() =>
              workspaceRef.current?.addTab({
                data: { kind },
                id,
                title
              })
            }
          >
            Open {title}
          </DemoButton>
        ))}
      </div>
      <DemoWorkspace
        // Tabs are only added by the buttons above, which use the imperative API
        canAddTabs={() => false}
        className="h-50"
        defaultModel={emptyModel}
        renderEmptyTabset={() => (
          <div className="absolute inset-0 flex items-center justify-center text-ink/60 text-sm">
            Add content using the buttons above
          </div>
        )}
        workspaceRef={workspaceRef}
      />
      <SectionHeader>Adding tabs from a tabset</SectionHeader>
      <div>
        Components within a tabset (e.g. a button rendered by{" "}
        <code>renderTabsetToolbar</code>) can add tabs to that tabset with the{" "}
        <Link to="/hooks/use-parent-tabset">
          <code>useParentTabset</code>
        </Link>{" "}
        hook:
      </div>
      <Code html={UseParentTabsetHTML} />
      <SectionHeader>Updating and closing tabs</SectionHeader>
      <div>
        The <code>updateTab</code> method changes a tab's title, data, or flags,
        and <code>closeTab</code> closes it. Within a tab's content, the{" "}
        <Link to="/hooks/use-parent-tab">
          <code>useParentTab</code>
        </Link>{" "}
        hook returns the tab, so content can update or close its own tab:
      </div>
      <Code html={UpdateTabHTML} />
      <Callout>
        A tab's <code>data</code> is replaced rather than merged when it is
        updated. To confirm before the user closes a tab (e.g. one with unsaved
        changes), see{" "}
        <Link to="/examples/workspace/custom-tabsets">custom tabsets</Link>.
      </Callout>
      <SectionHeader>Empty tabsets</SectionHeader>
      <div>
        By default, a tabset is removed when its last tab is closed or dragged
        away. A tabset with the <code>keepWhenEmpty</code> flag stays instead
        (e.g. an editor area that should remain as a drop target), showing the
        Workspace's <code>renderEmptyTabset</code> content, until it's closed
        with the <code>closeTabset</code> method or the{" "}
        <code>useParentTabset</code> hook's <code>close</code> function:
      </div>
      <Code html={KeepWhenEmptyHTML} />
      <div>
        In the workspace below, the tabset on the right has the{" "}
        <code>keepWhenEmpty</code> flag. Close its tabs (or drag them into the
        tabset on the left) and it stays, as a place to drop them again. Each
        tabset's close button (×) removes it, along with any tabs it still has.
      </div>
      <DemoWorkspace
        canCloseTabset={() => true}
        className="h-60"
        defaultModel={keepWhenEmptyModel}
        showResetButton
      />
      <Callout>
        Closing a tabset also closes any tabs it contains. Like the rest of the
        imperative API, it isn't restricted by tabs' <code>disableClose</code>{" "}
        flags.
      </Callout>
      <SectionHeader>Maximizing tabsets</SectionHeader>
      <div>
        A maximized tabset covers the rest of the workspace until it's restored.
        The <code>maximizeTabset</code> and <code>restoreTabset</code> methods
        do this from outside of the workspace, and the{" "}
        <code>useParentTabset</code> hook from within a tabset (e.g. a button in
        its toolbar):
      </div>
      <Code html={MaximizeTabsetHTML} />
      <div>
        Which tabset is maximized is part of the model, so it's saved and
        restored with the rest of the layout. While a tabset is maximized, tabs
        can only be dragged within it.
      </div>
      <Callout>
        Changes made with the imperative API are reported by{" "}
        <code>onModelChanged</code> (with <code>isUserInteraction</code> set to{" "}
        <code>false</code>), so they're saved like any other change.
      </Callout>
    </Box>
  );
}
