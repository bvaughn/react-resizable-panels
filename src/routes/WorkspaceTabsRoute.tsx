import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import { useWorkspaceRef, type WorkspaceModel } from "react-resizable-panels";
import { html as UseParentTabsetHTML } from "../../public/generated/examples/UseParentTabset.json";
import { html as AddTabAtTargetHTML } from "../../public/generated/examples/WorkspaceAddTabAtTarget.json";
import { html as KeepWhenEmptyHTML } from "../../public/generated/examples/WorkspaceKeepWhenEmpty.json";
import { html as OpenTabHTML } from "../../public/generated/examples/WorkspaceOpenTab.json";
import { html as SelectTabHTML } from "../../public/generated/examples/WorkspaceSelectTab.json";
import { html as TabRemovalSelectionHTML } from "../../public/generated/examples/WorkspaceTabRemovalSelection.json";
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

const FILES: {
  id: string;
  kind: "about" | "notes";
  title: string;
}[] = [
  { id: "notes", kind: "notes", title: "Notes" },
  { id: "about", kind: "about", title: "About" }
];

// Several tabs in one tabset, to show which tab is selected when the selected one is closed
const tabRemovalModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "tabset",
    id: "tabs",
    tabs: [
      { id: "about", title: "About", data: { kind: "about" } },
      { id: "counter", title: "Counter", data: { kind: "counter" } },
      { id: "notes", title: "Notes", data: { kind: "notes" } },
      { id: "nested", title: "Nested panels", data: { kind: "nested" } }
    ]
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

export default function WorkspaceTabsRoute() {
  const workspaceRef = useWorkspaceRef<DemoTab>();

  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Opening and closing tabs" />
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
        <code>tabsetId</code>) or position (<code>index</code>), or add it
        without selecting it (<code>select: false</code>).
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
      <div>
        The <code>target</code> option adds the tab anywhere a tab can be
        dropped (see{" "}
        <Link anchor="drop-targets" to="/examples/workspace/drag-and-drop">
          drop targets
        </Link>
        ), including in a new tabset beside another tabset or along an edge of
        the workspace, and <code>size</code> sets the new tabset's share of its
        split. For example, in a new tabset below the "grid" tabset taking 30%
        of its split, or along the bottom of the workspace, 200 pixels tall:
      </div>
      <Code html={AddTabAtTargetHTML} />
      <Callout>
        Users can also{" "}
        <Link to="/examples/workspace/drag-and-drop/dragging-tabs-in">
          drag new tabs in
        </Link>{" "}
        from outside of the workspace.
      </Callout>
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
        <Link anchor="blocking-changes" to="/examples/workspace/restrictions">
          blocking changes
        </Link>
        .
      </Callout>
      <SectionHeader>Selecting tabs</SectionHeader>
      <div>
        Each tabset's selected tab is saved in the model as its{" "}
        <Link to="/model/tabset-node">
          <code>selectedId</code>
        </Link>
        . The <code>selectTab</code> method selects a tab by id (in whichever
        tabset contains it):
      </div>
      <Code html={SelectTabHTML} />
      <div>
        When the selected tab is closed (or dragged to another tabset), the tab
        after it is selected by default. With the{" "}
        <code>tabRemovalSelectionBehavior</code> prop set to{" "}
        <code>"recent"</code>, the tab that was selected before it is selected
        instead, like in an IDE:
      </div>
      <Code html={TabRemovalSelectionHTML} />
      <div>
        In the workspace below, select a few tabs and then close the selected
        one.
      </div>
      <DemoWorkspace
        className="h-50"
        defaultModel={tabRemovalModel}
        showResetButton
        tabRemovalSelectionBehavior="recent"
      />
      <Callout>
        Each tabset's recently selected tabs are saved in the model (as{" "}
        <Link to="/model/tabset-node">
          <code>recentTabIds</code>
        </Link>
        ), so they're restored with the rest of the model. If none of the
        remaining tabs has been selected, the tab after the closed one is
        selected.
      </Callout>
      <SectionHeader>Empty tabsets</SectionHeader>
      <div>
        Tabsets are created and removed as tabs are opened, closed, and moved.
        By default, a tabset is removed when its last tab is closed or dragged
        away. A tabset with the <code>keepWhenEmpty</code> flag stays instead
        (e.g. an editor area that should remain as a drop target), showing the
        Workspace's <code>renderEmptyTabset</code> content, until it's closed
        with the <code>closeTabset</code> method or the{" "}
        <code>useParentTabset</code> hook's <code>close</code> function. The
        example hides its close button in the only tabset in the workspace,
        since closing it would just close its tabs:
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
        className="h-80"
        defaultModel={keepWhenEmptyModel}
        showMaximizeButtons={false}
        showResetButton
      />
      <Callout>
        Closing a tabset also closes any tabs it contains. Like the rest of the
        imperative API, it isn't restricted by tabs' <code>disableClose</code>{" "}
        flags.
      </Callout>
    </Box>
  );
}
